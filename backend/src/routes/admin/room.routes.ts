import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { query, pool } from "../../../db";
import { importRoomsFromExcelFile } from "../../services/roomImport.service";
import { verifyToken, verifyAdmin } from "../../middleware/auth";

const router = Router();

const uploadsDir = path.join(__dirname, "..", "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, uploadsDir),
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "room-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// GET /api/admin/rooms — all rooms with pricing
router.get("/", verifyToken, verifyAdmin, async (_req: any, res: Response) => {
  try {
    const result = await query(`
      SELECT r.*,
             p.price_half_day_internal, p.price_full_day_internal,
             p.price_half_day_co_organizer, p.price_full_day_co_organizer,
             p.price_half_day_external, p.price_full_day_external
      FROM rooms r
      LEFT JOIN room_pricing p ON r.id = p.room_id AND p.is_active = TRUE
      ORDER BY r.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("[admin/rooms] Error fetching rooms:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลห้อง" });
  }
});

// PUT /api/admin/rooms/:id/status — toggle room active status
router.put(
  "/:id/status",
  verifyToken,
  verifyAdmin,
  async (req: any, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;
    try {
      await query("UPDATE rooms SET is_active = $1 WHERE id = $2", [isActive, id]);
      res.json({ message: "อัปเดตสถานะสำเร็จ" });
    } catch (err) {
      console.error("[admin/rooms] Error updating status:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  }
);

// PUT /api/admin/rooms/:id — update room details + pricing
router.put(
  "/:id",
  verifyToken,
  verifyAdmin,
  async (req: any, res: Response) => {
    const { id } = req.params;
    const { name, type, capacity, prices } = req.body;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "UPDATE rooms SET name = $1, type = $2, capacity = $3 WHERE id = $4",
        [name, type, capacity, id]
      );
      if (prices) {
        await client.query(
          "UPDATE room_pricing SET is_active = FALSE WHERE room_id = $1",
          [id]
        );
        await client.query(
          `INSERT INTO room_pricing (room_id, price_half_day_internal, price_full_day_internal,
            price_half_day_co_organizer, price_full_day_co_organizer,
            price_half_day_external, price_full_day_external, effective_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [
            id,
            prices.halfInternal || 0,
            prices.fullInternal || 0,
            prices.halfCoop || 0,
            prices.fullCoop || 0,
            prices.halfExternal || 0,
            prices.fullExternal || 0,
          ]
        );
      }
      await client.query("COMMIT");
      res.json({ message: "อัปเดตข้อมูลห้องสำเร็จ" });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("[admin/rooms] Error updating room:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดต" });
    } finally {
      client.release();
    }
  }
);

// POST /api/admin/rooms/upload-image — upload room image
router.post(
  "/upload-image",
  verifyToken,
  verifyAdmin,
  upload.single("roomImage"),
  async (req: any, res: Response) => {
    const { roomId } = req.body;
    if (!req.file) return res.status(400).json({ message: "กรุณาเลือกไฟล์" });
    const imageUrl = `/uploads/${req.file.filename}`;
    try {
      await query("UPDATE rooms SET image_url = $1, updated_at = NOW() WHERE id = $2", [
        imageUrl,
        roomId,
      ]);
      res.json({ message: "อัปโหลดรูปภาพสำเร็จ", imageUrl });
    } catch (err) {
      console.error("[admin/rooms] Error uploading image:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  }
);

// POST /api/admin/import-rooms — import rooms from Excel
router.post(
  "/import",
  verifyToken,
  verifyAdmin,
  upload.single("file"),
  async (req: any, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "กรุณาเลือกไฟล์ Excel" });
    }

    try {
      const count = await importRoomsFromExcelFile(req.file.path);
      res.json({
        message: `นำเข้าข้อมูลสำเร็จทั้งหมด ${count} รายการ (จากทุก Sheet)`,
        count,
      });
    } catch (err) {
      console.error("[admin/rooms/import] Error:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการประมวลผลไฟล์" });
    } finally {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  }
);

export default router;
