import { Router, Request, Response } from "express";
import { query } from "../../db";

const router = Router();

// GET / — featured rooms ranked by booking / usage frequency
router.get("/", async (_req: Request, res: Response) => {
  try {
    const queryText = `
      SELECT
        r.*,
        p.price_half_day_internal,
        p.price_full_day_internal,
        p.price_half_day_co_organizer,
        p.price_full_day_co_organizer,
        p.price_half_day_external,
        p.price_full_day_external,
        COUNT(b.id)::int AS booking_count
      FROM rooms r
      LEFT JOIN room_pricing p
        ON r.id = p.room_id AND p.is_active = TRUE
      LEFT JOIN bookings b
        ON b.room_id = r.id
        AND b.status NOT IN ('disapproved', 'ยกเลิกแล้ว')
      WHERE r.is_active = TRUE
      GROUP BY
        r.id,
        p.price_half_day_internal,
        p.price_full_day_internal,
        p.price_half_day_co_organizer,
        p.price_full_day_co_organizer,
        p.price_half_day_external,
        p.price_full_day_external
      ORDER BY booking_count DESC, r.id ASC
      LIMIT 3
    `;
    const result = await query(queryText);
    res.json(result.rows);
  } catch (err) {
    console.error("[featured-rooms] Error fetching featured rooms:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลห้องแนะนำ" });
  }
});

export default router;
