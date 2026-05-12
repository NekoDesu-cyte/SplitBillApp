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
  const raw_texts = [];
  
  const stop_words_regex = /^(sub\s*tot|total|bayar|cash|kembali|tunai|change|pajak|tax|ppn|diskon|discount|payment|debit|kredit|bca|mandiri|bri|bni|qris|ovo|gopay|dana|linkaja|shopeepay|admin|service)/i;
  const ignore_words = ['jl', 'jl.', 'telp', 'tanggal', 'waktu', 'kasir', 'struk', 'pos1', 'check no', 'www.'];
  
  for (const text of lines) {
    const t_lower = text.toLowerCase();
    if (stop_words_regex.test(t_lower)) {
        break;
    }
    if (text && !ignore_words.some(w => t_lower.includes(w))) {
      raw_texts.push(text);
    }
  }
  
  let current_name = null;
  
  for (let i = 0; i < raw_texts.length; i++) {
    const text = raw_texts[i];
    const text_lower = text.toLowerCase();
    
    const priceRegex = /(?:rp\s*)?(\d{1,3}(?:[.,]\d{3})+)/gi;
    let prices = [];
    let match;
    while ((match = priceRegex.exec(text_lower)) !== null) {
      prices.push(match[0]);
    }
    
    if (prices.length > 0) {
      const total_price_str = prices[prices.length - 1];
      const price_val = cleanPrice(total_price_str);
      
      if (price_val < 500) continue;
      
      let qty = 1;
      for (let k = i; k >= Math.max(0, i - 3); k--) {
        const check_text = raw_texts[k].toLowerCase();
        
        const m_full = check_text.match(/\b(\d{1,2})\s*[xX\*]\s*\d{3,}/);
        const m_end = check_text.match(/[xX\*]\s*(\d{1,2})\b(?!\s*[,.]\d)/);
        const m_start = check_text.match(/\b(\d{1,2})\s*[xX\*]/);
        const m_lusin = check_text.match(/\b(\d{1,2})\s+[a-z]+\s+[xX\*]/);
        const m_front = check_text.match(/^(\d{1,2})\s+[a-z]/);
        
        if (m_full) { qty = parseInt(m_full[1], 10); break; }
        else if (m_lusin) { qty = parseInt(m_lusin[1], 10); break; }
        else if (m_start) { qty = parseInt(m_start[1], 10); break; }
        else if (m_end) { qty = parseInt(m_end[1], 10); break; }
        else if (m_front && k === i) { qty = parseInt(m_front[1], 10); break; }
      }
      
      if (qty === 0) qty = 1;
      const unit_price = Math.floor(price_val / qty);
      
      let name_candidate = text;
      for (const p of prices) {
        const escapedP = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        name_candidate = name_candidate.replace(new RegExp(`(?:rp\\s*)?${escapedP}`, 'ig'), '');
      }
      
      name_candidate = name_candidate.replace(/\b\d{1,2}\s*[xX\*]\s*\d{3,}/ig, '');
      name_candidate = name_candidate.replace(/[xX\*]\s*\d{1,2}\b(?!\s*[,.]\d)/ig, '');
      name_candidate = name_candidate.replace(/\b\d{1,2}\s*[xX\*]/ig, '');
      name_candidate = name_candidate.replace(/\b\d{1,2}\s+[a-z]+\s+[xX\*]/ig, '');
      name_candidate = name_candidate.replace(/^(\d{1,2})\s+/, '').trim();
      name_candidate = name_candidate.replace(/[^a-zA-Z0-9]+$/, '').trim();
      
      const toTitleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      
      if (name_candidate.replace(/[^a-zA-Z]/g, '').length > 2) {
        items.push({ name: toTitleCase(name_candidate), price: unit_price, quantity: qty });
        current_name = null;
      } else {
        if (current_name) {
          items.push({ name: toTitleCase(current_name), price: unit_price, quantity: qty });
          current_name = null;
        } else {
          for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
            let prev_text = raw_texts[j];
            let clean_prev = prev_text.replace(/^\d+[\.\s]*/, '').trim();
            clean_prev = clean_prev.replace(/\b\d{1,2}\s*[xX\*]\s*\d{3,}/ig, '');
            clean_prev = clean_prev.replace(/[xX\*]\s*\d{1,2}\b(?!\s*[,.]\d)/ig, '');
            clean_prev = clean_prev.replace(/\b\d{1,2}\s*[xX\*]/ig, '');
            clean_prev = clean_prev.replace(/[^a-zA-Z0-9]+$/, '').trim();
            
            if (/[a-zA-Z]{3,}/.test(clean_prev)) {
              items.push({ name: toTitleCase(clean_prev), price: unit_price, quantity: qty });
              break;
            }
          }
        }
      }
    } else {
      let clean_text = text.replace(/^\d+[\.\s]*/, '').trim();
      if (/[a-zA-Z]{3,}/.test(clean_text)) {
        current_name = clean_text;
      }
    }
  }
  
  const hard_filter_words = ['sub', 'tot', 'bayar', 'cash', 'kembali', 'change', 'pajak', 'tax', 'diskon', 'meja', 'kode'];
  const unique_items = [];
  const seen = new Set();
  
  for (const item of items) {
    const name_lower = item.name.toLowerCase();
    const is_forbidden = hard_filter_words.some(hw => name_lower.includes(hw));
    
    if (item.price > 0 && item.name.length > 2 && !is_forbidden) {
      const identifier = `${item.name.toLowerCase()}-${item.price}`;
      if (!seen.has(identifier)) {
        seen.add(identifier);
        unique_items.push(item);
      }
    }
  }
  
  return unique_items;
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
    const claimsStr = JSON.stringify(req.body.claims || {});
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

    if (unpaidParticipants.length === 0) {
      // Jika semua sudah lunas, otomatis tutup ruangan
      await sql`UPDATE rooms SET is_closed = TRUE WHERE id = ${req.params.roomId}`;
    }

    io.to(req.params.roomId).emit("paymentNotification", { participantName });

    io.to(req.params.roomId).emit("updateData");
    res.json({ success: true, auto_closed: unpaidParticipants.length === 0 });
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

httpServer.listen(5000, () => console.log("🚀 Server Ready"));
