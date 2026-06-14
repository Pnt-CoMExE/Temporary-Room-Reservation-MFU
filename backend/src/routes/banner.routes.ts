import { Router, Request, Response } from "express";
import { query } from "../../db";

const router = Router();

// GET /api/banners — list all active banners
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await query(
      "SELECT * FROM banners WHERE is_active = TRUE ORDER BY id ASC"
    );
    res.json(
      result.rows.map((b: any) => ({
        id: b.id,
        title: b.title,
        image: b.image_url,
        link: b.link,
      }))
    );
  } catch (err) {
    console.error("[banners] Error fetching banners:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลแบนเนอร์" });
  }
});

export default router;
