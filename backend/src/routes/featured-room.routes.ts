import { Router, Request, Response } from "express";
import { query } from "../../db";

const router = Router();

// GET / — featured rooms (one per type)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const queryText = `
      (SELECT r.*, p.price_half_day_internal, p.price_full_day_internal, p.price_half_day_co_organizer, p.price_full_day_co_organizer, p.price_half_day_external, p.price_full_day_external FROM rooms r LEFT JOIN room_pricing p ON r.id = p.room_id AND p.is_active = TRUE WHERE r.is_active = TRUE AND r.type LIKE '%ห้องประชุม%' LIMIT 1)
      UNION ALL
      (SELECT r.*, p.price_half_day_internal, p.price_full_day_internal, p.price_half_day_co_organizer, p.price_full_day_co_organizer, p.price_half_day_external, p.price_full_day_external FROM rooms r LEFT JOIN room_pricing p ON r.id = p.room_id AND p.is_active = TRUE WHERE r.is_active = TRUE AND r.type LIKE '%ลานกิจกรรม%' LIMIT 1)
      UNION ALL
      (SELECT r.*, p.price_half_day_internal, p.price_full_day_internal, p.price_half_day_co_organizer, p.price_full_day_co_organizer, p.price_half_day_external, p.price_full_day_external FROM rooms r LEFT JOIN room_pricing p ON r.id = p.room_id AND p.is_active = TRUE WHERE r.is_active = TRUE AND r.type LIKE '%ห้องปฏิบัติการ%' LIMIT 1)
    `;
    const result = await query(queryText);
    res.json(result.rows);
  } catch (err) {
    console.error("[featured-rooms] Error fetching featured rooms:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลห้องแนะนำ" });
  }
});

export default router;
