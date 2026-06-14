import { Router, Request, Response } from "express";
import { query } from "../../db";
import { validateRoomId } from "../middleware/validate";

const router = Router();

// GET /api/rooms — list all active rooms with optional filters
router.get("/", async (req: Request, res: Response) => {
  const { type, capacity } = req.query;

  try {
    let queryText = `
      SELECT r.*,
             p.price_half_day_internal, p.price_full_day_internal,
             p.price_half_day_co_organizer, p.price_full_day_co_organizer,
             p.price_half_day_external, p.price_full_day_external
      FROM rooms r
      LEFT JOIN room_pricing p ON r.id = p.room_id AND p.is_active = TRUE
      WHERE r.is_active = TRUE
    `;
    const params: string[] = [];

    if (type) {
      params.push(type as string);
      queryText += ` AND r.type = $${params.length}`;
    }

    if (capacity) {
      if (capacity === "small")
        queryText +=
          " AND CAST(SUBSTRING(r.capacity FROM '[0-9]+') AS INTEGER) <= 50";
      else if (capacity === "medium")
        queryText +=
          " AND CAST(SUBSTRING(r.capacity FROM '[0-9]+') AS INTEGER) > 50 AND CAST(SUBSTRING(r.capacity FROM '[0-9]+') AS INTEGER) <= 150";
      else if (capacity === "large")
        queryText +=
          " AND CAST(SUBSTRING(r.capacity FROM '[0-9]+') AS INTEGER) > 150";
    }

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (err) {
    console.error("[rooms] Error fetching rooms:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลห้อง" });
  }
});

// GET /api/rooms/:id — single room details
router.get("/:id", ...validateRoomId, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const queryText = `
      SELECT r.*,
             p.price_half_day_internal, p.price_full_day_internal,
             p.price_half_day_co_organizer, p.price_full_day_co_organizer,
             p.price_half_day_external, p.price_full_day_external
      FROM rooms r
      LEFT JOIN room_pricing p ON r.id = p.room_id AND p.is_active = TRUE
      WHERE r.id = $1
    `;
    const result = await query(queryText, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบห้องที่ระบุ" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("[rooms] Error fetching room:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลห้อง" });
  }
});

// GET /api/rooms/:id/bookings — bookings for a specific room
router.get(
  "/:id/bookings",
  ...validateRoomId,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const result = await query(
        `SELECT booking_date, time_slot, status, memo_document_url
         FROM bookings
         WHERE room_id = $1 AND status NOT IN ('disapproved', 'ยกเลิกแล้ว')
         ORDER BY booking_date ASC`,
        [id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error("[rooms] Error fetching room bookings:", err);
      res
        .status(500)
        .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลคิวห้อง" });
    }
  }
);

export default router;
