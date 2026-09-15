import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { query } from "../../../db";
import { verifyToken, verifyAdmin } from "../../middleware/auth";
import { adminNameFromReq, logAdminAction } from "../../services/auditLog.service";

const router = Router();

const uploadsDir = path.join(__dirname, "..", "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, uploadsDir),
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "banner-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("รองรับเฉพาะไฟล์รูปภาพ"));
    }
    cb(null, true);
  },
});

function mapBanner(row: any) {
  return {
    id: row.id,
    title: row.title,
    image: row.image_url,
    link: row.link || "/rooms",
    isActive: row.is_active,
  };
}

function unlinkUpload(imageUrl?: string | null) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) return;
  const filePath = path.join(uploadsDir, path.basename(imageUrl));
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("[admin/banners] Failed to delete file:", err);
    }
  }
}

// GET /api/admin/banners — all banners (including inactive)
router.get("/", verifyToken, verifyAdmin, async (_req: any, res: Response) => {
  try {
    const result = await query("SELECT * FROM banners ORDER BY id DESC");
    res.json(result.rows.map(mapBanner));
  } catch (err) {
    console.error("[admin/banners] Error fetching banners:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลแบนเนอร์" });
  }
});

// POST /api/admin/banners — upload + create banner
router.post(
  "/",
  verifyToken,
  verifyAdmin,
  upload.single("bannerImage"),
  async (req: any, res: Response) => {
    const title = String(req.body?.title || "").trim();
    const link = String(req.body?.link || "/rooms").trim() || "/rooms";

    if (!title) {
      return res.status(400).json({ message: "กรุณาระบุหัวข้อแบนเนอร์" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "กรุณาอัปโหลดรูปภาพแบนเนอร์" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    try {
      const result = await query(
        `INSERT INTO banners (title, image_url, link, is_active)
         VALUES ($1, $2, $3, TRUE) RETURNING *`,
        [title, imageUrl, link]
      );
      await logAdminAction(
        adminNameFromReq(req),
        "เพิ่มแบนเนอร์",
        `หัวข้อ: ${title}`
      );
      res.status(201).json(mapBanner(result.rows[0]));
    } catch (err) {
      unlinkUpload(imageUrl);
      console.error("[admin/banners] Error creating banner:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างแบนเนอร์" });
    }
  }
);

// PUT /api/admin/banners/:id/status — toggle active
router.put(
  "/:id/status",
  verifyToken,
  verifyAdmin,
  async (req: any, res: Response) => {
    const { id } = req.params;
    const isActive = Boolean(req.body?.isActive);

    try {
      const result = await query(
        "UPDATE banners SET is_active = $1 WHERE id = $2 RETURNING *",
        [isActive, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "ไม่พบแบนเนอร์" });
      }
      const banner = result.rows[0];
      await logAdminAction(
        adminNameFromReq(req),
        "เปิด/ปิดแบนเนอร์",
        `"${banner.title}" → ${isActive ? "แสดงผล" : "ซ่อน"}`
      );
      res.json(mapBanner(banner));
    } catch (err) {
      console.error("[admin/banners] Error updating status:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตสถานะแบนเนอร์" });
    }
  }
);

// DELETE /api/admin/banners/:id
router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  async (req: any, res: Response) => {
    const { id } = req.params;

    try {
      const result = await query(
        "DELETE FROM banners WHERE id = $1 RETURNING *",
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "ไม่พบแบนเนอร์" });
      }
      const banner = result.rows[0];
      unlinkUpload(banner.image_url);
      await logAdminAction(
        adminNameFromReq(req),
        "ลบแบนเนอร์",
        `หัวข้อ: ${banner.title}`
      );
      res.json({ message: "ลบแบนเนอร์สำเร็จ" });
    } catch (err) {
      console.error("[admin/banners] Error deleting banner:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบแบนเนอร์" });
    }
  }
);

export default router;
