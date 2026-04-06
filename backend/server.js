const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// สร้างตัวแปร app เพื่อใช้งาน Express
const app = express();

// อนุญาตให้หน้าเว็บ Vue ส่งข้อมูลเข้ามาได้
app.use(cors());
app.use(express.json());

// ตั้งค่าการเชื่อมต่อฐานข้อมูล PostgreSQL
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
  const { firstName, lastName, username, email, password } = req.body;

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
      `INSERT INTO users (first_name, last_name, username, email, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5, 'student')`,
      [firstName, lastName, username, email, passwordHash],
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

    const refreshToken = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET || "my_super_secret_key",
      { expiresIn: "7d" },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await pool.query(
      `INSERT INTO user_sessions (user_id, refresh_token, ip_address, user_agent, expires_at) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        user.user_id,
        refreshToken,
        req.ip,
        req.headers["user-agent"],
        expiresAt,
      ],
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
// สั่งให้ Server ทำงาน
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server รันอยู่บน http://localhost:${PORT}`);
});
