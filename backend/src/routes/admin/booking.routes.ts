import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import { query, pool } from "../../../db";
import { verifyToken, verifyAdmin } from "../../middleware/auth";
import { sendBookingStatusEmail } from "../../services/email.service";

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

// GET /api/admin/bookings — all bookings with user + room details
router.get("/", verifyToken, verifyAdmin, async (_req: any, res: Response) => {
  try {
    const result = await query(`
      SELECT b.*, u.firstname, u.lastname, u.email as user_email,
             r.name as room_name, r.location as room_location,
             f.rating as feedback_rating, f.comment as feedback_comment
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      LEFT JOIN feedbacks f ON b.id = f.booking_id
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("[admin/bookings] Error fetching bookings:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลการจอง" });
  }
});

// PUT /api/admin/bookings/:id/status — update booking status
router.put(
  "/:id/status",
  verifyToken,
  verifyAdmin,
  upload.single("approvalDocument"),
  async (req: any, res: Response) => {
    const { id } = req.params;
    const { status, remarks, adminId } = req.body;
    const documentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      if (documentUrl) {
        await query(
          `UPDATE bookings SET status = $1, remarks = $2, approved_by = $3,
           approved_at = NOW(), approval_document_url = $4 WHERE id = $5`,
          [status, remarks, adminId, documentUrl, id]
        );
      } else {
        await query(
          `UPDATE bookings SET status = $1, remarks = $2, approved_by = $3,
           approved_at = NOW() WHERE id = $4`,
          [status, remarks, adminId, id]
        );
      }

      // Trigger status email notification
      (async () => {
        try {
          const detailRes = await query(
            `SELECT b.booking_no, u.email, r.name as room_name
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN rooms r ON b.room_id = r.id
             WHERE b.id = $1`,
            [id]
          );
          if (detailRes.rows.length > 0) {
            const { booking_no, email, room_name } = detailRes.rows[0];
            await sendBookingStatusEmail(email, booking_no, room_name, status, remarks);
          }
        } catch (e) {
          console.error("[admin/bookings] Email status notification error:", e);
        }
      })();

      res.json({ message: "อัปเดตสถานะการจองสำเร็จ", documentUrl });
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

      const archive = archiver("zip", { zlib: { level: 9 } });

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
