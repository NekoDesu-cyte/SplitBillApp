import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import multer from "multer";
import { exec } from "child_process";
import fs from "fs";

const JWT_SECRET = "SplitBillSecret2026";
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
const sql = neon(process.env.DATABASE_URL);

// Konfigurasi folder penampung foto sementara
const upload = multer({ dest: "uploads/" });

// --- AUTH API ---
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] =
      await sql`INSERT INTO users (name, email, password) VALUES (${name}, ${email.toLowerCase()}, ${hashedPassword}) RETURNING id, name, email`;
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: "Email sudah ada" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [user] =
      await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`;
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: "Email/Password salah" });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- OCR API ---
app.post("/api/ocr", upload.single("receipt"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Foto tidak ditemukan" });

  const imagePath = req.file.path;

  // Jalankan script Python
  exec(`python extract.py "${imagePath}"`, (error, stdout, stderr) => {
    // Hapus foto setelah berhasil dibaca agar memori tidak penuh
    fs.unlinkSync(imagePath);

    if (error) {
      console.error("OCR Error:", error);
      return res.status(500).json({ error: "Gagal memproses struk" });
    }

    try {
      const items = JSON.parse(stdout);
      res.json({ items });
    } catch (e) {
      res.status(500).json({ error: "Gagal membaca hasil OCR" });
    }
  });
});

// --- ROOM API ---
app.post("/api/rooms", async (req, res) => {
  const {
    name,
    hostId,
    code,
    taxPercent,
    servicePercent,
    paymentInfo,
    items,
    hostPart,
    creatorId,
  } = req.body;
  try {
    const [room] =
      await sql`INSERT INTO rooms (name, host_id, code, tax_percent, service_percent, payment_provider, payment_account, creator_id) VALUES (${name}, ${hostId}, ${code}, ${taxPercent}, ${servicePercent}, ${paymentInfo.provider}, ${paymentInfo.accountNumber}, ${creatorId || null}) RETURNING *`;
    await sql`INSERT INTO participants (id, room_id, name, avatar, role) VALUES (${hostPart.id}, ${room.id}, ${hostPart.name}, ${hostPart.avatar}, 'OWNER')`;
    for (const item of items) {
      await sql`INSERT INTO items (room_id, name, price, total_quantity) VALUES (${room.id}, ${item.name}, ${item.price}, ${item.quantity})`;
    }
    res.status(201).json(room);
  } catch (e) {
    res.status(500).json({ error: "Gagal" });
  }
});

app.get("/api/rooms/:id", async (req, res) => {
  const [room] = await sql`SELECT * FROM rooms WHERE id = ${req.params.id}`;
  const items =
    await sql`SELECT * FROM items WHERE room_id = ${req.params.id} ORDER BY name ASC`;
  const participants =
    await sql`SELECT * FROM participants WHERE room_id = ${req.params.id}`;
  res.json({ ...room, items, participants });
});

app.get("/api/rooms/code/:code", async (req, res) => {
  const [room] =
    await sql`SELECT id FROM rooms WHERE code = ${req.params.code}`;
  if (!room) return res.status(404).json({ error: "Not found" });
  res.json({ id: room.id });
});

app.patch("/api/rooms/:roomId/items/:itemId", async (req, res) => {
  await sql`UPDATE items SET claims = ${req.body.claims} WHERE id = ${req.params.itemId}`;

  // Beritahu semua orang di ruangan ini bahwa ada perubahan data
  io.to(req.params.roomId).emit("updateData");

  res.json({ success: true });
});

app.patch("/api/rooms/:roomId/pay", async (req, res) => {
  const { clientId, participantName } = req.body;

  try {
    // Gunakan ON CONFLICT untuk mencegah duplikasi di level Database
    await sql`
      INSERT INTO participants (id, room_id, name, is_paid) 
      VALUES (${clientId}, ${req.params.roomId}, ${participantName}, TRUE)
      ON CONFLICT (id, room_id) 
      DO UPDATE SET is_paid = TRUE, name = ${participantName}
    `;

    io.to(req.params.roomId).emit("updateData");
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// Endpoint untuk menutup ruangan (Close Room)
// TAMBAHKAN INI: Endpoint untuk menutup ruangan
app.patch("/api/rooms/:roomId/close", async (req, res) => {
  const { roomId } = req.params;
  try {
    // Update status is_closed di database Neon
    const [result] = await sql`
      UPDATE rooms 
      SET is_closed = TRUE 
      WHERE id = ${roomId} 
      RETURNING id
    `;

    if (!result) {
      return res.status(404).json({ error: "Ruangan tidak ditemukan" });
    }

    // Beritahu semua orang lewat socket bahwa room sudah tertutup
    io.to(roomId).emit("updateData");

    res.json({ success: true, message: "Room berhasil ditutup" });
  } catch (e) {
    console.error("Error Closing Room:", e);
    res.status(500).json({ error: "Gagal menutup ruangan di database" });
  }
});

// Endpoint untuk mengambil History Room milik User tertentu
app.get("/api/rooms/user/:userId/history", async (req, res) => {
  try {
    // Mengambil room yang dibuat oleh user (host_id)
    const history = await sql`
      SELECT * FROM rooms 
      WHERE host_id = ${req.params.userId} 
      ORDER BY created_at DESC
    `;
    res.json(history);
  } catch (e) {
    res.status(500).json({ error: "Gagal mengambil history" });
  }
});

// --- LOGIKA SOCKET.IO ---
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`🏠 User ${socket.id} bergabung ke Room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

httpServer.listen(5000, () => console.log("🚀 Server Ready"));
