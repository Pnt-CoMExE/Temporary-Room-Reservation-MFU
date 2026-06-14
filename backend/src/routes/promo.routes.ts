import { Router, Response } from "express";
import { query } from "../../db";
import { verifyToken } from "../middleware/auth";
import { validatePromoCode } from "../middleware/validate";

const router = Router();

// POST /api/promo-codes/validate — validate a promo code
router.post(
  "/validate",
  verifyToken,
  ...validatePromoCode,
  async (req: any, res: Response) => {
    const { code } = req.body;
    try {
      const result = await query(
        "SELECT * FROM promo_codes WHERE UPPER(code) = UPPER($1) AND is_active = TRUE",
        [(code as string).trim()]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "รหัสโปรโมชั่นไม่ถูกต้อง หรือหมดอายุแล้ว" });
      }

      const promo = result.rows[0];
      const usageCount = await query(
        "SELECT COUNT(*) FROM bookings WHERE promo_code = UPPER($1)",
        [(code as string).trim()]
      );

      if (parseInt(usageCount.rows[0].count as string) >= promo.limit_count) {
        return res
          .status(400)
          .json({ message: "รหัสโปรโมชั่นนี้ถูกใช้งานครบจำนวนแล้ว" });
      }

      res.json({
        code: promo.code,
        discount: parseFloat(promo.discount),
        message: `ใช้ส่วนลด ${parseFloat(promo.discount).toLocaleString()} บาท สำเร็จ!`,
      });
    } catch (err) {
      console.error("[promo] Error validating promo code:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบโค้ด" });
    }
  }
);

export default router;
