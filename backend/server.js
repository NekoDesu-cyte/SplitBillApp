import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import multer from "multer";
import vision from "@google-cloud/vision";
import fs from "fs";

const JWT_SECRET = "SplitBillSecret2026";
const app = express();
const httpServer = createServer(app);

const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: "bagibayar-9f5639182963.json"
});

function cleanPrice(priceStr) {
  const digits = priceStr.replace(/\D/g, "");
  return parseInt(digits, 10) || 0;
}

function parseReceipt(textAnnotations) {
  if (!textAnnotations || textAnnotations.length === 0) return [];
  
  const fullText = textAnnotations[0].description;
  const lines = fullText.split('\n').map(line => line.trim()).filter(line => line);
  
  const items = [];
  const seenIdentifiers = new Set();
  
  // Kata-kata yang mengindikasikan baris tersebut BUKAN nama menu makanan/minuman
  const ignoreLineKeywords = [
    'subtotal', 'sub tot', 'total', 'bayar', 'cash', 'kembali', 'change', 
    'pajak', 'tax', 'ppn', 'diskon', 'discount', 'kembalian', 'tunai', 
    'debit', 'kredit', 'bca', 'mandiri', 'qris', 'gopay', 'ovo', 'dana', 
    'shopeepay', 'jl.', 'jalan', 'telp', 'tanggal', 'waktu', 'struk', 'kasir',
    'admin', 'service', 'pos1', 'check no', 'www.'
  ];

  let lastNameCandidate = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();
    
    // Lewati baris jika merupakan baris ringkasan akhir/header struk tertentu
    // Tapi JANGAN di-break agar tetap bisa membaca menu di baris lain di bawahnya
    const isSummaryLine = ['subtotal', 'sub tot', 'total bayar', 'total item', 'cash', 'kembali', 'change'].some(w => lineLower.includes(w));
    if (isSummaryLine) continue;

    // Cari angka yang berpotensi sebagai harga (minimal ratusan/ribuan, bisa pakai titik/koma atau tanpa titik)
    // Berakhiran 00 atau format ribuan standar
    const priceRegex = /\b(?:rp\s*)?(\d{1,3}(?:[.,]\d{3})+|\d{3,7}00)\b/gi;
    let matches = [];
    let match;
    while ((match = priceRegex.exec(lineLower)) !== null) {
      // Hapus karakter non-digit untuk mendapatkan nilai integer murni
      const val = parseInt(match[1].replace(/\D/g, ""), 10);
      if (val >= 500) {
        matches.push({ text: match[0], value: val });
      }
    }

    // Ekstrak informasi Qty jika ada format seperti "2x", "2 x", "x2"
    let qty = 1;
    const qtyMatch = lineLower.match(/\b(\d{1,2})\s*[xX\*]/) || lineLower.match(/[xX\*]\s*(\d{1,2})\b/);
    if (qtyMatch) {
      qty = parseInt(qtyMatch[1], 10) || 1;
    }

    if (matches.length > 0) {
      // Ambil harga terakhir di baris tersebut sebagai total harga item
      const itemTotalPrice = matches[matches.length - 1].value;
      const unitPrice = Math.floor(itemTotalPrice / qty);

      // Bersihkan nama item dari teks harga dan kuantitas
      let cleanName = line;
      matches.forEach(m => {
        cleanName = cleanName.replace(new RegExp(m.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
      });
      cleanName = cleanName.replace(/\b\d{1,2}\s*[xX\*]\s*\d*/gi, '');
      cleanName = cleanName.replace(/[xX\*]\s*\d{1,2}\b/gi, '');
      cleanName = cleanName.replace(/^(?:rp|idr)\b/gi, '');
      cleanName = cleanName.replace(/^[^a-zA-Z]+/, ''); // Hapus simbol/angka di awal
      cleanName = cleanName.replace(/[^a-zA-Z0-9)]+$/, ''); // Hapus simbol di akhir
      cleanName = cleanName.trim();

      let finalName = cleanName;

      // Jika di baris ini tidak tersisa teks nama yang valid (panjang huruf < 3),
      // kemungkinan besar nama menu ada di baris sebelumnya
      const letterCount = (cleanName.match(/[a-zA-Z]/g) || []).length;
      if (letterCount < 3 && lastNameCandidate) {
        finalName = lastNameCandidate;
      }

      // Validasi akhir nama menu
      const finalLetterCount = (finalName.match(/[a-zA-Z]/g) || []).length;
      const isForbiddenWord = ignoreLineKeywords.some(w => finalName.toLowerCase().includes(w));

      if (finalLetterCount >= 3 && !isForbiddenWord) {
        // Format Title Case
        const titleCaseName = finalName.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        
        // Hindari duplikasi item yang sama persis
        const identifier = `${titleCaseName.toLowerCase()}-${unitPrice}`;
        if (!seenIdentifiers.has(identifier)) {
          seenIdentifiers.add(identifier);
          items.push({
            name: titleCaseName,
            price: unitPrice,
            quantity: qty
          });
        }
        // Reset last candidate setelah berhasil digunakan
        lastNameCandidate = null;
      }
    } else {
      // Jika baris tidak memiliki harga, simpan sebagai kandidat nama menu untuk baris harga berikutnya
      // asalkan bukan kata-kata yang harus diabaikan
      const letterCount = (line.match(/[a-zA-Z]/g) || []).length;
      const isForbiddenWord = ignoreLineKeywords.some(w => lineLower.includes(w));
      if (letterCount >= 3 && !isForbiddenWord) {
        lastNameCandidate = line.trim();
      }
    }
  }

  return items;
}


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
app.post("/api/ocr", upload.single("receipt"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Foto tidak ditemukan" });

  const imagePath = req.file.path;

  try {
    const [result] = await visionClient.textDetection(imagePath);
    const textAnnotations = result.textAnnotations;
    
    const items = parseReceipt(textAnnotations);
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    res.json({ items });
  } catch (error) {
    console.error("OCR Error:", error);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    res.status(500).json({ error: "Gagal memproses struk" });
  }
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

app.post("/api/rooms/:roomId/join", async (req, res) => {
  const { clientId, participantName, avatar } = req.body;
  try {
    const defaultAvatar = avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${clientId}`;
    // Insert if not exists
    await sql`
      INSERT INTO participants (id, room_id, name, avatar, role) 
      VALUES (${clientId}, ${req.params.roomId}, ${participantName}, ${defaultAvatar}, 'GUEST')
      ON CONFLICT (id, room_id) DO NOTHING
    `;
    
    io.to(req.params.roomId).emit("updateData");
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal join" });
  }
});

app.get("/api/rooms/:id", async (req, res) => {
  try {
    let [room] = await sql`
      SELECT *, 
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - COALESCE(last_activity_at, created_at))) as seconds_since_active 
      FROM rooms WHERE id = ${req.params.id}
    `;
    if (!room) return res.status(404).json({ error: "Not found" });

    // Auto-reset logic (1 hour = 3600 seconds)
    const diffSeconds = Number(room.seconds_since_active);

    if (diffSeconds >= 3600 && !room.is_closed) {
      const unpaidParticipants = await sql`SELECT id FROM participants WHERE room_id = ${room.id} AND is_paid = false`;
      const unpaidIds = unpaidParticipants.map(p => p.id);

      let anyChanged = false;
      if (unpaidIds.length > 0) {
        const items = await sql`SELECT id, claims FROM items WHERE room_id = ${room.id}`;
        for (const item of items) {
          let claims = typeof item.claims === 'string' ? JSON.parse(item.claims) : (item.claims || {});
          let itemChanged = false;
          for (const uid of unpaidIds) {
            if (claims[uid]) {
              delete claims[uid];
              itemChanged = true;
              anyChanged = true;
            }
          }
          if (itemChanged) {
            await sql`UPDATE items SET claims = ${JSON.stringify(claims)}::jsonb WHERE id = ${item.id}`;
          }
        }
      }
      
      await sql`UPDATE rooms SET last_activity_at = CURRENT_TIMESTAMP WHERE id = ${room.id}`;
      let [updatedRoom] = await sql`
        SELECT *, 
          EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - COALESCE(last_activity_at, created_at))) as seconds_since_active 
        FROM rooms WHERE id = ${req.params.id}
      `;
      room = updatedRoom;
      
      if (anyChanged) {
         io.to(req.params.id).emit("updateData");
      }
    }

    const items = await sql`SELECT * FROM items WHERE room_id = ${req.params.id} ORDER BY name ASC`;
    const participants = await sql`SELECT * FROM participants WHERE room_id = ${req.params.id}`;
    
    // Kirim sisa waktu ke frontend
    const currentDiff = Number(room.seconds_since_active);
    const remainingSeconds = Math.max(0, 3600 - currentDiff);
    
    res.json({ ...room, items, participants, remainingSeconds });
  } catch (error) {
    console.error("Error GET room:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/rooms/code/:code", async (req, res) => {
  const [room] =
    await sql`SELECT id FROM rooms WHERE code = ${req.params.code}`;
  if (!room) return res.status(404).json({ error: "Not found" });
  res.json({ id: room.id });
});

app.patch("/api/rooms/:roomId/items/:itemId", async (req, res) => {
  try {
    const { claims, clientId } = req.body;

    // 🔒 BUG FIX #6: Blokir update jika user yang request sudah is_paid = true
    if (clientId) {
      const [participant] = await sql`
        SELECT is_paid FROM participants 
        WHERE id = ${String(clientId)} AND room_id = ${req.params.roomId}
      `;
      if (participant?.is_paid) {
        return res.status(403).json({ error: "Kamu sudah lunas, tidak bisa mengubah pesanan." });
      }
    }

    const claimsStr = JSON.stringify(claims || {});
    await sql`UPDATE items SET claims = ${claimsStr}::jsonb WHERE id = ${req.params.itemId}`;
    await sql`UPDATE rooms SET last_activity_at = CURRENT_TIMESTAMP WHERE id = ${req.params.roomId}`;

    // Beritahu semua orang di ruangan ini bahwa ada perubahan data
    io.to(req.params.roomId).emit("updateData");

    res.json({ success: true });
  } catch (error) {
    console.error("Error PATCH item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
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

    // Cek apakah masih ada participant yang belum bayar
    const unpaidParticipants = await sql`
      SELECT id FROM participants 
      WHERE room_id = ${req.params.roomId} AND is_paid = FALSE
    `;

    // Agar mendukung pesanan menu ronde berikutnya (multironde), kita tidak menutup ruangan secara otomatis.
    // Host tetap bisa menutup ruangan secara manual melalui tombol Lock di pojok kanan atas.

    io.to(req.params.roomId).emit("paymentNotification", { participantName });

    io.to(req.params.roomId).emit("updateData");
    res.json({ success: true, auto_closed: false });
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
const roomOnlineUsers = {};

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("joinRoom", ({ roomId, clientId }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.clientId = clientId;
    
    if (!roomOnlineUsers[roomId]) {
      roomOnlineUsers[roomId] = new Set();
    }
    roomOnlineUsers[roomId].add(clientId);
    io.to(roomId).emit("onlineUsers", Array.from(roomOnlineUsers[roomId]));
    
    console.log(`🏠 User ${clientId} bergabung ke Room: ${roomId}`);
  });

  socket.on("leaveRoom", ({ roomId, clientId }) => {
    socket.leave(roomId);
    if (roomOnlineUsers[roomId]) {
      roomOnlineUsers[roomId].delete(clientId);
      io.to(roomId).emit("onlineUsers", Array.from(roomOnlineUsers[roomId]));
    }
    console.log(`🚪 User ${clientId} keluar dari Room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    if (socket.roomId && socket.clientId && roomOnlineUsers[socket.roomId]) {
      roomOnlineUsers[socket.roomId].delete(socket.clientId);
      io.to(socket.roomId).emit("onlineUsers", Array.from(roomOnlineUsers[socket.roomId]));
    }
    console.log("❌ User disconnected:", socket.id);
  });
});
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server Ready on port ${PORT}`));
