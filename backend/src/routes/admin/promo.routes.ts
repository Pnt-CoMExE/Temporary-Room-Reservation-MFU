import { Router, Response } from "express";
import { query } from "../../../db";
import { verifyToken, verifyAdmin } from "../../middleware/auth";
import { validateCreatePromoCode } from "../../middleware/validate";

const router = Router();

// GET /api/admin/promocodes — list all promo codes with usage count
router.get("/", verifyToken, verifyAdmin, async (_req: any, res: Response) => {
  try {
    const result = await query(`
      SELECT p.*,
             (SELECT COUNT(*) FROM bookings WHERE promo_code = p.code) AS used_count
      FROM promo_codes p
      ORDER BY p.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("[admin/promos] Error fetching promo codes:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงรหัสส่วนลด" });
  }
});

// POST /api/admin/promocodes — create a new promo code
router.post(
  "/",
  verifyToken,
  verifyAdmin,
  ...validateCreatePromoCode,
  async (req: any, res: Response) => {
    const { code, discount, limit_count } = req.body;
    try {
      const result = await query(
        "INSERT INTO promo_codes (code, discount, limit_count) VALUES ($1, $2, $3) RETURNING *",
        [code, discount, limit_count || 100]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("[admin/promos] Error creating promo code:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างรหัสส่วนลด (รหัสอาจซ้ำ)" });
    }
  }
);

// PUT /api/admin/promocodes/:id/status — toggle promo code active status
router.put(
  "/:id/status",
  verifyToken,
  verifyAdmin,
  async (req: any, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;
    try {
      await query("UPDATE promo_codes SET is_active = $1 WHERE id = $2", [isActive, id]);
      res.json({ message: "อัปเดตสถานะโค้ดสำเร็จ" });
    } catch (err) {
      console.error("[admin/promos] Error updating status:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ" });
    }
  }
);

export default router;
