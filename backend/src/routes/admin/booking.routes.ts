import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ZipArchive } from "archiver";
import { query, pool } from "../../../db";
import { verifyToken, verifyAdmin } from "../../middleware/auth";
import { sendBookingStatusEmail } from "../../services/email.service";
import { adminNameFromReq, logAdminAction } from "../../services/auditLog.service";
import { createNotification } from "../../services/notification.service";

const STATUS_LABEL_TH: Record<string, string> = {
  pending: "รออนุมัติ",
  approved_pending_payment: "รอชำระเงิน",
  approved_paid: "ชำระเงินแล้ว",
  completed: "สำเร็จแล้ว",
  disapproved: "ไม่อนุมัติ",
  ยกเลิกแล้ว: "ยกเลิกแล้ว",
  approved: "อนุมัติแล้ว",
};

function statusLabelTh(status: string): string {
  return STATUS_LABEL_TH[status] || status;
}

const router = Router();

const uploadsDir = path.join(__dirname, "..", "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, uploadsDir),
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "approval-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const ORG_TYPES = new Set(["internal", "co_op", "external"]);

function normalizeOrgType(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const v = String(raw).trim().toLowerCase();
  if (v === "co_organizer" || v === "coop") return "co_op";
  return ORG_TYPES.has(v) ? v : null;
}

function pickRoomPrice(
  pricing: Record<string, unknown> | null | undefined,
  orgType: string,
  timeSlot: string
): number {
  if (!pricing) return 0;
  const isFull = timeSlot === "full";
  const key =
    orgType === "external"
      ? isFull
        ? "price_full_day_external"
        : "price_half_day_external"
      : orgType === "co_op"
        ? isFull
          ? "price_full_day_co_organizer"
          : "price_half_day_co_organizer"
        : isFull
          ? "price_full_day_internal"
          : "price_half_day_internal";
  return Number(pricing[key] || 0);
}

// GET /api/admin/bookings — all bookings with user + room details + pricing tiers
router.get("/", verifyToken, verifyAdmin, async (_req: any, res: Response) => {
  try {
    const result = await query(`
      SELECT b.*, u.firstname, u.lastname, u.email as user_email,
             r.name as room_name, r.location as room_location,
             f.rating as feedback_rating, f.comment as feedback_comment,
             TRIM(CONCAT(COALESCE(admin_u.firstname, ''), ' ', COALESCE(admin_u.lastname, ''))) AS admin_name,
             p.price_half_day_internal, p.price_full_day_internal,
             p.price_half_day_co_organizer, p.price_full_day_co_organizer,
             p.price_half_day_external, p.price_full_day_external
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      LEFT JOIN LATERAL (
        SELECT * FROM room_pricing
        WHERE room_id = r.id
        ORDER BY effective_date DESC NULLS LAST, id DESC
        LIMIT 1
      ) p ON TRUE
      LEFT JOIN feedbacks f ON b.id = f.booking_id
      LEFT JOIN users admin_u ON b.approved_by = admin_u.id
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("[admin/bookings] Error fetching bookings:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง" });
  }
});

// PUT /api/admin/bookings/:id/status — update booking status (+ optional rate tier on approve)
router.put(
  "/:id/status",
  verifyToken,
  verifyAdmin,
  upload.single("approvalDocument"),
  async (req: any, res: Response) => {
    const { id } = req.params;
    const { status, remarks, adminId } = req.body;
    const organizationType = normalizeOrgType(req.body.organizationType || req.body.organization_type);
    const resolvedAdminId = Number(adminId) || Number(req.user?.userId) || null;
    const documentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const prevRes = await query(
        `SELECT status, organization_type, room_price, addons_price, total_price,
                room_id, time_slot, booking_no
         FROM bookings WHERE id = $1`,
        [id]
      );
      if (prevRes.rows.length === 0) {
        return res.status(404).json({ message: "ไม่พบรายการจอง" });
      }
      const previous = prevRes.rows[0];
      const previousStatus = String(previous.status || "");

      let rateLog = "";
      let nextOrg = previous.organization_type;
      let nextRoomPrice = Number(previous.room_price || 0);
      let nextTotal = Number(previous.total_price || 0);

      if (
        organizationType &&
        (status === "approved_pending_payment" || status === "approved")
      ) {
        const pricingRes = await query(
          `SELECT price_half_day_internal, price_full_day_internal,
                  price_half_day_co_organizer, price_full_day_co_organizer,
                  price_half_day_external, price_full_day_external
           FROM room_pricing
           WHERE room_id = $1
           ORDER BY effective_date DESC NULLS LAST, id DESC
           LIMIT 1`,
          [previous.room_id]
        );
        const pricing = pricingRes.rows[0] || null;
        const newRoomPrice = pickRoomPrice(pricing, organizationType, String(previous.time_slot || ""));
        const oldRoomPrice = Number(previous.room_price || 0);
        const oldOrg = String(previous.organization_type || "");
        nextOrg = organizationType;
        nextRoomPrice = newRoomPrice;
        nextTotal = Number(previous.total_price || 0) - oldRoomPrice + newRoomPrice;
        if (nextTotal < 0) nextTotal = newRoomPrice + Number(previous.addons_price || 0);

        if (oldOrg !== organizationType || oldRoomPrice !== newRoomPrice) {
          rateLog = ` | เรท: ${oldOrg || "-"}→${organizationType} | ราคาห้อง: ${oldRoomPrice}→${newRoomPrice} | รวม: ${previous.total_price}→${nextTotal}`;
        }
      }

      if (documentUrl) {
        await query(
          `UPDATE bookings SET status = $1, remarks = $2, approved_by = $3,
           approved_at = NOW(), approval_document_url = $4,
           organization_type = $5, room_price = $6, total_price = $7
           WHERE id = $8`,
          [status, remarks, resolvedAdminId, documentUrl, nextOrg, nextRoomPrice, nextTotal, id]
        );
      } else {
        await query(
          `UPDATE bookings SET status = $1, remarks = $2, approved_by = $3,
           approved_at = NOW(),
           organization_type = $4, room_price = $5, total_price = $6
           WHERE id = $7`,
          [status, remarks, resolvedAdminId, nextOrg, nextRoomPrice, nextTotal, id]
        );
      }

      // Trigger status email + in-app notification
      (async () => {
        try {
          const detailRes = await query(
            `SELECT b.booking_no, b.user_id, u.email, r.name as room_name
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN rooms r ON b.room_id = r.id
             WHERE b.id = $1`,
            [id]
          );
          if (detailRes.rows.length > 0) {
            const { booking_no, user_id, email, room_name } = detailRes.rows[0];
            await sendBookingStatusEmail(email, booking_no, room_name, status, remarks);
            await createNotification({
              userId: Number(user_id),
              type: "booking_status",
              title: `อัปเดตสถานะการจอง`,
              body: `${booking_no} · ${room_name} → ${statusLabelTh(String(status))}${
                remarks ? ` (${remarks})` : ""
              }`,
              link: "/dashboard",
            });
          }
        } catch (e) {
          console.error("[admin/bookings] Email/notification status error:", e);
        }
      })();

      const fromLabel = statusLabelTh(previousStatus);
      const toLabel = statusLabelTh(String(status));
      const transition =
        previousStatus === status
          ? `สถานะ: ${toLabel}`
          : `เปลี่ยนจาก「${fromLabel}」เป็น「${toLabel}」`;

      await logAdminAction(
        adminNameFromReq(req),
        `อัปเดตสถานะการจอง #${id}`,
        `${transition}${remarks ? ` | เหตุผล: ${remarks}` : ""}${rateLog}`,
        Number(id)
      );

      if (rateLog) {
        await logAdminAction(
          adminNameFromReq(req),
          `เปลี่ยนเรทราคาการจอง #${id}`,
          rateLog.replace(/^\s*\|\s*/, ""),
          Number(id)
        );
      }

      res.json({
        message: "อัปเดตสถานะการจองสำเร็จ",
        documentUrl,
        organizationType: nextOrg,
        roomPrice: nextRoomPrice,
        totalPrice: nextTotal,
      });
    } catch (err) {
      console.error("[admin/bookings] Error updating status:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ" });
    }
  }
);

// GET /api/admin/bookings/:id/template — approval document template
router.get(
  "/:id/template",
  verifyToken,
  verifyAdmin,
  async (req: any, res: Response) => {
    const { id } = req.params;
    try {
      const result = await query(
        `SELECT b.*, u.firstname, u.lastname, r.name as room_name
         FROM bookings b
         JOIN users u ON b.user_id = u.id
         JOIN rooms r ON b.room_id = r.id
         WHERE b.id = $1`,
        [id]
      );

      if (result.rows.length === 0) return res.status(404).send("Not found");

      const booking = result.rows[0];
      const htmlTemplate = `
        <html>
        <head>
          <meta charset="utf-8">
          <title>แบบฟอร์มขออนุมัติใช้พื้นที่ (FM-AM-01)</title>
          <style>
            body { font-family: 'Sarabun', sans-serif; padding: 40px; line-height: 1.6; }
            h2 { text-align: center; }
            .content { margin-top: 30px; font-size: 16px; }
            .signature { margin-top: 80px; text-align: right; padding-right: 50px; }
          </style>
        </head>
        <body>
          <h2>แบบฟอร์มขออนุมัติใช้พื้นที่และสิ่งอำนวยความสะดวก</h2>
          <div class="content">
            <p><strong>รหัสการจอง:</strong> ${booking.booking_no}</p>
            <p><strong>ชื่อผู้ขอใช้:</strong> ${booking.partner_name || booking.firstname + " " + booking.lastname}</p>
            <p><strong>หน่วยงาน/ประเภท:</strong> ${booking.organization_type}</p>
            <p><strong>ห้อง/พื้นที่ที่ขอใช้:</strong> ${booking.room_name}</p>
            <p><strong>วันที่ขอใช้:</strong> ${new Date(booking.booking_date).toLocaleDateString("th-TH")}</p>
            <p><strong>ช่วงเวลา:</strong> ${booking.time_slot}</p>
            <p><strong>วัตถุประสงค์:</strong> ${booking.objective}</p>
            <p><strong>ค่าใช้จ่ายโดยประมาณ:</strong> ${parseFloat(booking.total_price).toLocaleString()} บาท</p>
            ${booking.memo_document_url ? `<p><strong>แนบหนังสือบันทึกข้อความ:</strong> <a href="${booking.memo_document_url}">คลิกดูเอกสารแนบ</a></p>` : ""}
          </div>
          <div class="signature">
            <p>ลงชื่อ.......................................................(ผู้อนุมัติ)</p>
            <p>(.......................................................)</p>
            <p>ตำแหน่ง.......................................................</p>
            <p>วันที่........./........./.........</p>
          </div>
        </body>
        </html>
      `;
      res.send(htmlTemplate);
    } catch (err) {
      console.error("[admin/bookings] Error generating template:", err);
      res.status(500).send("Error generating template");
    }
  }
);

// POST /api/admin/bookings/export-zip — export booking documents as ZIP
router.post(
  "/export-zip",
  verifyToken,
  verifyAdmin,
  async (req: any, res: Response) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "กรุณาระบุรายการที่ต้องการดาวน์โหลด" });
    }

    try {
      const result = await query(
        `SELECT id, booking_no, memo_document_url, approval_document_url
         FROM bookings WHERE id = ANY($1::int[])`,
        [ids]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "ไม่พบข้อมูลการจอง" });
      }

      const fileMap: { filePath: string; zipName: string }[] = [];

      for (const booking of result.rows) {
        const folderName = `${booking.booking_no}`;

        if (booking.memo_document_url) {
          const filePath = path.join(
            uploadsDir,
            path.basename(booking.memo_document_url)
          );
          if (fs.existsSync(filePath)) {
            fileMap.push({
              filePath,
              zipName: `${folderName}/01_หนังสือบันทึกข้อความ${path.extname(booking.memo_document_url)}`,
            });
          }
        }

        if (booking.approval_document_url) {
          const filePath = path.join(
            uploadsDir,
            path.basename(booking.approval_document_url)
          );
          if (fs.existsSync(filePath)) {
            fileMap.push({
              filePath,
              zipName: `${folderName}/02_ใบอนุมัติ${path.extname(booking.approval_document_url)}`,
            });
          }
        }
      }

      if (fileMap.length === 0) {
        return res.status(404).json({ message: "ไม่พบไฟล์เอกสารสำหรับรายการที่เลือก" });
      }

      const archive = new ZipArchive({ zlib: { level: 9 } });

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="booking-documents-${Date.now()}.zip"`
      );

      archive.pipe(res);

      for (const { filePath, zipName } of fileMap) {
        archive.file(filePath, { name: zipName });
      }

      await archive.finalize();
    } catch (err) {
      console.error("[admin/bookings] Error creating ZIP:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างไฟล์ ZIP" });
    }
  }
);

export default router;
