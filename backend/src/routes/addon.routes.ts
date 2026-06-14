import { Router, Request, Response } from "express";
import { query } from "../../db";

const router = Router();

// GET /api/addons — list all active add-ons
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await query("SELECT * FROM addons WHERE is_active = TRUE");
    res.json(result.rows);
  } catch (err) {
    console.error("[addons] Error fetching addons:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์เสริม" });
  }
});

export default router;
