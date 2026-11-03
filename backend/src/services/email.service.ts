import { env } from "../config/env";
import { formatBookingDateTh, timeSlotLabelTh } from "../utils/bookingFormat";

export { timeSlotLabelTh, formatBookingDateTh } from "../utils/bookingFormat";

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

const APPROVED_STATUSES = new Set([
  "approved",
  "approved_pending_payment",
  "approved_paid",
  "pending_verification",
  "completed",
]);

function isApprovedStatus(status: string): boolean {
  return APPROVED_STATUSES.has(String(status || "").trim());
}

function statusLabelForEmail(status: string): { text: string; color: string; approved: boolean } {
  const s = String(status || "").trim();
  if (s === "approved_pending_payment") {
    return { text: "อนุมัติแล้ว — รอชำระเงิน", color: "#16a34a", approved: true };
  }
  if (s === "approved_paid" || s === "completed") {
    return { text: "อนุมัติแล้ว — ชำระเงินแล้ว", color: "#16a34a", approved: true };
  }
  if (s === "pending_verification") {
    return { text: "อนุมัติแล้ว — รอตรวจสอบการชำระเงิน", color: "#16a34a", approved: true };
  }
  if (s === "approved") {
    return { text: "อนุมัติแล้ว", color: "#16a34a", approved: true };
  }
  if (s === "disapproved") {
    return { text: "ไม่อนุมัติ", color: "#dc2626", approved: false };
  }
  // Unknown status: do not claim "disapproved"
  return { text: s || "อัปเดตสถานะ", color: "#374151", approved: isApprovedStatus(s) };
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (env.smtpEnabled()) {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.port === 465,
        auth: {
          user: env.smtp.user,
          pass: env.smtp.pass,
        },
      });

      await transporter.sendMail({
        from: env.smtp.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
        })),
      });
      return true;
    }

    console.log(`[EMAIL SERVICE] (console mode) To: ${options.to}`);
    console.log(`[EMAIL SERVICE] Subject: ${options.subject}`);
    console.log(`[EMAIL SERVICE] Content: ${options.html.substring(0, 100)}...`);
    if (options.attachments?.length) {
      console.log(
        `[EMAIL SERVICE] Attachments: ${options.attachments.map((a) => a.filename).join(", ")}`
      );
    }
    return true;
  } catch (err) {
    console.error("[EMAIL SERVICE] Error sending email:", err);
    return false;
  }
}

export async function sendBookingSubmittedEmail(
  userEmail: string,
  bookingNo: string,
  roomName: string,
  bookingDate: string,
  timeSlot?: string
): Promise<boolean> {
  const slotLabel = timeSlotLabelTh(String(timeSlot || ""));
  const dateLabel = formatBookingDateTh(bookingDate);
  const subject = `[MFU Space Reservation] ยืนยันการส่งคำขอจองห้อง - ${bookingNo} (${slotLabel})`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #ba0b2f;">ส่งคำขอจองห้องเรียบร้อยแล้ว</h2>
      <p>เรียน คุณผู้ใช้,</p>
      <p>ระบบได้รับการจองห้องของคุณเรียบร้อยแล้ว รายละเอียดมีดังนี้:</p>
      <ul>
        <li><strong>รหัสการจอง:</strong> ${bookingNo}</li>
        <li><strong>ห้อง/พื้นที่:</strong> ${roomName}</li>
        <li><strong>วันที่จอง:</strong> ${dateLabel}</li>
        <li><strong>ช่วงเวลา:</strong> ${slotLabel}</li>
        <li><strong>สถานะ:</strong> รอการอนุมัติ (Pending)</li>
      </ul>
      <p>กรุณารอการตรวจสอบและอนุมัติจากเจ้าหน้าที่บริหารจัดการทรัพย์สิน มฟล.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">ระบบบริหารจัดการพื้นที่เช่าชั่วคราว มหาวิทยาลัยแม่ฟ้าหลวง</p>
    </div>
  `;
  return sendEmail({ to: userEmail, subject, html });
}

export async function sendBookingStatusEmail(
  userEmail: string,
  bookingNo: string,
  roomName: string,
  status: string,
  remarks?: string,
  bookingDate?: string,
  timeSlot?: string
): Promise<boolean> {
  const { text: statusText, color, approved } = statusLabelForEmail(status);
  const reason = String(remarks || "").trim();
  const slotLabel = timeSlotLabelTh(String(timeSlot || ""));
  const dateLabel = formatBookingDateTh(bookingDate);

  const subject = `[MFU Space Reservation] แจ้งผลการพิจารณาการจองห้อง - ${bookingNo} [${statusText}] (${slotLabel})`;

  let reasonBlock = "";
  if (!approved) {
    reasonBlock = reason
      ? `<p style="margin-top: 16px; padding: 12px; background: #fef2f2; border-left: 4px solid #dc2626;">
           <strong>เหตุผลที่ไม่อนุมัติ:</strong><br/>${reason}
         </p>`
      : `<p style="margin-top: 16px; padding: 12px; background: #fef2f2; border-left: 4px solid #dc2626;">
           <strong>เหตุผลที่ไม่อนุมัติ:</strong> ไม่ระบุเหตุผล
         </p>`;
  } else if (reason) {
    reasonBlock = `<p><strong>หมายเหตุเพิ่มเติม:</strong> ${reason}</p>`;
  }

  const nextStep = approved
    ? status === "approved_pending_payment" || status === "approved"
      ? `<p>คุณสามารถเข้าสู่ระบบที่แดชบอร์ดเพื่อชำระเงินค่าบริการได้</p>`
      : ""
    : `<p>หากมีข้อสงสัย กรุณาติดต่อเจ้าหน้าที่บริหารจัดการทรัพย์สิน มฟล.</p>`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: ${color};">ผลการพิจารณาคำขอจองห้อง: ${statusText}</h2>
      <p>เรียน คุณผู้ใช้,</p>
      <p>คำขอจองห้องรหัส <strong>${bookingNo}</strong> สำหรับห้อง <strong>${roomName}</strong> ได้รับการพิจารณาเรียบร้อยแล้ว</p>
      <ul>
        <li><strong>วันที่จอง:</strong> ${dateLabel}</li>
        <li><strong>ช่วงเวลา:</strong> ${slotLabel}</li>
        <li><strong>สถานะปัจจุบัน:</strong> <span style="color: ${color}; font-weight: bold;">${statusText}</span></li>
      </ul>
      ${reasonBlock}
      ${nextStep}
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">ระบบบริหารจัดการพื้นที่เช่าชั่วคราว มหาวิทยาลัยแม่ฟ้าหลวง</p>
    </div>
  `;
  return sendEmail({ to: userEmail, subject, html });
}

export async function sendPaymentApprovedWithPermitEmail(
  userEmail: string,
  bookingNo: string,
  roomName: string,
  pdfBuffer: Buffer,
  bookingDate?: string,
  timeSlot?: string
): Promise<boolean> {
  const slotLabel = timeSlotLabelTh(String(timeSlot || ""));
  const dateLabel = formatBookingDateTh(bookingDate);
  const subject = `[MFU Space Reservation] ยืนยันการชำระเงินและใบอนุญาตใช้งานพื้นที่ - ${bookingNo} (${slotLabel})`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #16a34a;">ยืนยันการชำระเงินเรียบร้อยแล้ว</h2>
      <p>เรียน คุณผู้ใช้,</p>
      <p>เจ้าหน้าที่ได้ตรวจสอบและยืนยันการชำระเงินสำหรับรายการจอง <strong>${bookingNo}</strong> (${roomName}) เรียบร้อยแล้ว</p>
      <ul>
        <li><strong>วันที่จอง:</strong> ${dateLabel}</li>
        <li><strong>ช่วงเวลา:</strong> ${slotLabel}</li>
      </ul>
      <p>ระบบได้แนบเอกสาร <strong>"ใบอนุญาตใช้งานพื้นที่และใบเสร็จรับเงิน (Space Permit & Official Receipt)"</strong> มาพร้อมกับอีเมลนี้ กรุณาเก็บไว้เป็นหลักฐานในการเข้าใช้งานพื้นที่</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">ส่วนจัดการทรัพย์สิน มหาวิทยาลัยแม่ฟ้าหลวง</p>
    </div>
  `;
  return sendEmail({
    to: userEmail,
    subject,
    html,
    attachments: [
      {
        filename: `Permit_Receipt_${bookingNo}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}
