import { Router, Response } from "express";
import { verifyToken, verifyAdmin } from "../../middleware/auth";
import { adminNameFromReq, logAdminAction } from "../../services/auditLog.service";
import { broadcastToActiveUsers } from "../../services/notification.service";

const router = Router();

// POST /api/admin/broadcast — send in-app notification to all active users
router.post("/", verifyToken, verifyAdmin, async (req: any, res: Response) => {
  const title = String(req.body?.title || "").trim();
  const body = String(req.body?.body || req.body?.message || "").trim();
  const link = String(req.body?.link || "/home").trim() || "/home";

  if (!title || !body) {
    return res.status(400).json({ message: "กรุณากรอกหัวข้อและรายละเอียดประกาศ" });
  }
  if (title.length > 200 || body.length > 2000) {
    return res.status(400).json({ message: "หัวข้อหรือข้อความยาวเกินไป" });
  }

  try {
    const count = await broadcastToActiveUsers({ title, body, link });
    await logAdminAction(
      adminNameFromReq(req),
      "ส่งประกาศ (Broadcast)",
      `หัวข้อ: ${title} | ผู้รับ ${count} คน`
    );
    res.status(201).json({
      message: "ส่งประกาศสำเร็จ",
      recipientCount: count,
    });
  } catch (err) {
    console.error("[admin/broadcast] Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการส่งประกาศ" });
  }
});

export default router;
