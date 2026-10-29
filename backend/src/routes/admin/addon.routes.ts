import { Router, Response } from "express";
import { query } from "../../../db";
import { verifyToken, verifyAdmin } from "../../middleware/auth";
import { adminNameFromReq, logAdminAction } from "../../services/auditLog.service";

const router = Router();

function parsePrice(raw: unknown): number | null {
  if (raw === undefined || raw === null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return NaN;
  return n;
}

// GET /api/admin/addons — all add-ons (including inactive)
router.get("/", verifyToken, verifyAdmin, async (_req: any, res: Response) => {
  try {
    const result = await query(
      `SELECT id, name, price_per_unit, unit_name, is_active, image_url, created_at
       FROM addons
       ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (err: any) {
    // Fallback if image_url column not migrated yet
    if (err?.code === "42703") {
      const result = await query(
        `SELECT id, name, price_per_unit, unit_name, is_active, created_at
         FROM addons
         ORDER BY id ASC`
      );
      return res.json(result.rows.map((r: any) => ({ ...r, image_url: null })));
    }
    console.error("[admin/addons] Error fetching:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงอุปกรณ์เสริม" });
  }
});

// POST /api/admin/addons — create add-on
router.post("/", verifyToken, verifyAdmin, async (req: any, res: Response) => {
  const name = String(req.body?.name || "").trim();
  const unit_name = String(req.body?.unit_name || "ชิ้น").trim() || "ชิ้น";
  const image_url =
    typeof req.body?.image_url === "string" && req.body.image_url.trim()
      ? req.body.image_url.trim()
      : null;
  const price = parsePrice(req.body?.price_per_unit);

  if (!name) {
    return res.status(400).json({ message: "กรุณาระบุชื่ออุปกรณ์" });
  }
  if (price === null || Number.isNaN(price)) {
    return res.status(400).json({ message: "ราคาต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0" });
  }

  try {
    let result;
    try {
      result = await query(
        `INSERT INTO addons (name, price_per_unit, unit_name, image_url, is_active)
         VALUES ($1, $2, $3, $4, TRUE)
         RETURNING id, name, price_per_unit, unit_name, is_active, image_url`,
        [name, price, unit_name, image_url]
      );
    } catch (err: any) {
      if (err?.code !== "42703") throw err;
      result = await query(
        `INSERT INTO addons (name, price_per_unit, unit_name, is_active)
         VALUES ($1, $2, $3, TRUE)
         RETURNING id, name, price_per_unit, unit_name, is_active`,
        [name, price, unit_name]
      );
      result.rows[0] = { ...result.rows[0], image_url: null };
    }

    await logAdminAction(
      adminNameFromReq(req),
      "เพิ่มอุปกรณ์เสริม",
      `#${result.rows[0].id} ${name} · ฿${price}/${unit_name}`
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("[admin/addons] Error creating:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มอุปกรณ์เสริม" });
  }
});

// PUT /api/admin/addons/:id — update price / active / image / unit / name
router.put("/:id", verifyToken, verifyAdmin, async (req: any, res: Response) => {
  const id = Number(req.params.id);
  const { price_per_unit, is_active, image_url, unit_name, name } = req.body || {};

  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ message: "รหัสอุปกรณ์ไม่ถูกต้อง" });
  }

  const price = parsePrice(price_per_unit);
  if (price !== null && Number.isNaN(price)) {
    return res.status(400).json({ message: "ราคาต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0" });
  }

  const nameVal =
    typeof name === "string" && name.trim() ? name.trim() : null;
  const unitVal =
    typeof unit_name === "string" && unit_name.trim()
      ? unit_name.trim()
      : null;

  try {
    const result = await query(
      `UPDATE addons SET
         name = COALESCE($1, name),
         price_per_unit = COALESCE($2, price_per_unit),
         is_active = COALESCE($3, is_active),
         image_url = COALESCE($4, image_url),
         unit_name = COALESCE($5, unit_name)
       WHERE id = $6
       RETURNING id, name, price_per_unit, unit_name, is_active, image_url`,
      [
        nameVal,
        price,
        typeof is_active === "boolean" ? is_active : null,
        typeof image_url === "string" ? image_url : null,
        unitVal,
        id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบอุปกรณ์เสริม" });
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    if (err?.code === "42703") {
      const result = await query(
        `UPDATE addons SET
           name = COALESCE($1, name),
           price_per_unit = COALESCE($2, price_per_unit),
           is_active = COALESCE($3, is_active),
           unit_name = COALESCE($4, unit_name)
         WHERE id = $5
         RETURNING id, name, price_per_unit, unit_name, is_active`,
        [
          nameVal,
          price,
          typeof is_active === "boolean" ? is_active : null,
          unitVal,
          id,
        ]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "ไม่พบอุปกรณ์เสริม" });
      }
      return res.json({ ...result.rows[0], image_url: null });
    }
    console.error("[admin/addons] Error updating:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตอุปกรณ์เสริม" });
  }
});

export default router;
