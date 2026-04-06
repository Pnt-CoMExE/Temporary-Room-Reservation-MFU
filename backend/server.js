const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// 1. ประกาศสร้าง app ก่อนเป็นอันดับแรก
const app = express();

// 2. ตั้งค่า Middleware ต่างๆ
app.use(cors());
app.use(express.json());

// 3. จัดการเรื่องโฟลเดอร์สำหรับอัปโหลดรูปภาพ
// สร้างโฟลเดอร์ uploads อัตโนมัติถ้ายังไม่มี
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
// อนุญาตให้หน้าเว็บ (Frontend) เข้าถึงไฟล์รูปในโฟลเดอร์ uploads ได้โดยตรง
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ตั้งค่า Multer สำหรับจัดการไฟล์ที่อัปโหลด
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // เก็บไว้ในโฟลเดอร์ uploads
  },
  filename: (req, file, cb) => {
    // ตั้งชื่อไฟล์ใหม่ ป้องกันชื่อซ้ำ (เช่น profile-1681234567.jpg)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// 4. ตั้งค่าการเชื่อมต่อฐานข้อมูล PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool
  .connect()
  .then(() => console.log("✅ เชื่อมต่อ PostgreSQL สำเร็จ!"))
  .catch((err) => console.error("❌ เชื่อมต่อ PostgreSQL ล้มเหลว:", err.stack));

// ==========================================
// API สมัครสมาชิก (Register)
// ==========================================
app.post("/api/register", async (req, res) => {
  const { firstName, lastName, username, phone, email, password } = req.body;

  try {
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username],
    );

    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Username หรือ Email นี้ถูกใช้งานแล้ว" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await pool.query(
      `INSERT INTO users (first_name, last_name, username, phone_number, email, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5, $6, 'student')`,
      [firstName, lastName, username, phone, email, passwordHash],
    );

    res.status(201).json({ message: "สมัครสมาชิกสำเร็จ!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// ==========================================
// API เข้าสู่ระบบ (Login)
// ==========================================
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );

    if (userResult.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Username หรือ รหัสผ่าน ไม่ถูกต้อง" });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Username หรือ รหัสผ่าน ไม่ถูกต้อง" });
    }

    const token = jwt.sign(
      { userId: user.user_id, username: user.username },
      process.env.JWT_SECRET || "my_super_secret_key",
      { expiresIn: "1h" },
    );

    res.json({
      message: "เข้าสู่ระบบสำเร็จ",
      token: token,
      user: {
        id: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// ==========================================
// API ดึงข้อมูลโปรไฟล์ (ใช้ตอนเปิดหน้าเว็บ)
// ==========================================
app.get("/api/user/profile", async (req, res) => {
  const { email } = req.query;
  try {
    const result = await pool.query(
      "SELECT first_name, last_name, phone_number, profile_image FROM users WHERE email = $1",
      [email],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ==========================================
// API อัปเดตข้อมูลและเปลี่ยนรหัสผ่าน
// ==========================================
app.put("/api/user/profile", async (req, res) => {
  const { email, firstName, lastName, phone, oldPassword, newPassword } =
    req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
    const user = result.rows[0];

    // เช็คเรื่องเปลี่ยนรหัสผ่าน
    if (newPassword) {
      if (!oldPassword) {
        return res
          .status(400)
          .json({
            message: "กรุณากรอกรหัสผ่านเดิมเพื่อยืนยันการเปลี่ยนรหัสผ่าน",
          });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: "รหัสผ่านเดิมไม่ถูกต้อง" });
      }
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);
      await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [
        passwordHash,
        email,
      ]);
    }

    // อัปเดตข้อมูลทั่วไป
    await pool.query(
      "UPDATE users SET first_name = $1, last_name = $2, phone_number = $3 WHERE email = $4",
      [firstName, lastName, phone, email],
    );

    res.json({ message: "อัปเดตข้อมูลส่วนตัวสำเร็จ!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// ==========================================
// API สำหรับอัปโหลดรูปโปรไฟล์
// ==========================================
app.post(
  "/api/user/upload-profile",
  upload.single("profileImage"),
  async (req, res) => {
    const email = req.body.email;

    if (!req.file) {
      return res.status(400).json({ message: "กรุณาเลือกไฟล์รูปภาพ" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    try {
      await pool.query("UPDATE users SET profile_image = $1 WHERE email = $2", [
        imageUrl,
        email,
      ]);
      res.json({ message: "อัปโหลดรูปภาพสำเร็จ", imageUrl: imageUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "บันทึกรูปลงฐานข้อมูลไม่สำเร็จ" });
    }
  },
);

// ==========================================
// สั่งให้ Server ทำงาน
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server รันอยู่บน http://localhost:${PORT}`);
});
