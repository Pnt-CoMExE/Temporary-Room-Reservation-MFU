import { env } from "../config/env";
import {
  formatBookingDateEn,
  formatBookingDateTh,
  timeSlotLabelEn,
  timeSlotLabelTh,
} from "../utils/bookingFormat";

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
  /** Force Message-ID (first mail in a booking thread) */
  messageId?: string;
  /** Gmail/thread: reply to first booking email Message-ID */
  inReplyTo?: string;
  references?: string;
}

export type SendEmailResult = { ok: boolean; messageId?: string };

const APPROVED_STATUSES = new Set([
  "approved",
  "approved_pending_payment",
  "approved_paid",
  "pending_verification",
  "completed",
]);

const emailShell = (inner: string) => `
  <div style="font-family: Arial, Helvetica, sans-serif; padding: 20px; color: #333; line-height: 1.5;">
    ${inner}
  </div>
`;

const langDivider = `
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;" />
  <p style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 16px;">ภาษาไทย / Thai</p>
`;

/** Stable subject so Gmail groups Re: follow-ups into one conversation */
export function bookingThreadSubject(bookingNo: string): string {
  return `[MFU Space Reservation] ${String(bookingNo).trim()} — คำขอจอง`;
}

export function bookingReplySubject(bookingNo: string): string {
  return `Re: ${bookingThreadSubject(bookingNo)}`;
}

/** Stable root Message-ID we control (not rewritten by guessing SMTP output) */
export function bookingThreadMessageId(bookingNo: string): string {
  const safe = String(bookingNo)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
  return `<${safe}-root@mfu-space-reservation.local>`;
}

function isApprovedStatus(status: string): boolean {
  return APPROVED_STATUSES.has(String(status || "").trim());
}

function statusLabelForEmail(status: string): {
  textTh: string;
  textEn: string;
  color: string;
  approved: boolean;
} {
  const s = String(status || "").trim();
  if (s === "approved_pending_payment") {
    return {
      textTh: "อนุมัติแล้ว — รอชำระเงิน",
      textEn: "Approved — awaiting payment",
      color: "#16a34a",
      approved: true,
    };
  }
  if (s === "approved_paid" || s === "completed") {
    return {
      textTh: "อนุมัติแล้ว — ชำระเงินแล้ว",
      textEn: "Approved — paid",
      color: "#16a34a",
      approved: true,
    };
  }
  if (s === "pending_verification") {
    return {
      textTh: "อนุมัติแล้ว — รอตรวจสอบการชำระเงิน",
      textEn: "Approved — payment under review",
      color: "#16a34a",
      approved: true,
    };
  }
  if (s === "approved") {
    return {
      textTh: "อนุมัติแล้ว",
      textEn: "Approved",
      color: "#16a34a",
      approved: true,
    };
  }
  if (s === "disapproved") {
    return {
      textTh: "ไม่อนุมัติ",
      textEn: "Disapproved",
      color: "#dc2626",
      approved: false,
    };
  }
  return {
    textTh: s || "อัปเดตสถานะ",
    textEn: s || "Status update",
    color: "#374151",
    approved: isApprovedStatus(s),
  };
}

function normalizeMessageId(raw: string | undefined | null): string | undefined {
  const s = String(raw || "").trim();
  if (!s) return undefined;
  if (s.startsWith("<") && s.endsWith(">")) return s;
  return `<${s}>`;
}

function threadHeaders(threadId?: string): Pick<EmailOptions, "inReplyTo" | "references"> {
  const id = normalizeMessageId(threadId);
  if (!id) return {};
  return { inReplyTo: id, references: id };
}

export async function sendEmail(options: EmailOptions): Promise<SendEmailResult> {
  try {
    const forcedId = normalizeMessageId(options.messageId);
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

      const info = await transporter.sendMail({
        from: env.smtp.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        messageId: forcedId,
        inReplyTo: options.inReplyTo,
        references: options.references,
        attachments: options.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
        })),
      });
      return {
        ok: true,
        messageId: forcedId || normalizeMessageId(info.messageId),
      };
    }

    console.log(`[EMAIL SERVICE] (console mode) To: ${options.to}`);
    console.log(`[EMAIL SERVICE] Subject: ${options.subject}`);
    if (forcedId) {
      console.log(`[EMAIL SERVICE] Message-ID: ${forcedId}`);
    }
    if (options.inReplyTo) {
      console.log(`[EMAIL SERVICE] In-Reply-To: ${options.inReplyTo}`);
    }
    console.log(`[EMAIL SERVICE] Content: ${options.html.substring(0, 3500)}...`);
    if (options.attachments?.length) {
      console.log(
        `[EMAIL SERVICE] Attachments: ${options.attachments.map((a) => a.filename).join(", ")}`
      );
    }
    return { ok: true, messageId: forcedId };
  } catch (err) {
    console.error("[EMAIL SERVICE] Error sending email:", err);
    return { ok: false };
  }
}

export async function sendBookingSubmittedEmail(
  userEmail: string,
  bookingNo: string,
  roomName: string,
  bookingDate: string,
  timeSlot?: string
): Promise<SendEmailResult> {
  const slotTh = timeSlotLabelTh(String(timeSlot || ""));
  const slotEn = timeSlotLabelEn(String(timeSlot || ""));
  const dateTh = formatBookingDateTh(bookingDate);
  const dateEn = formatBookingDateEn(bookingDate);
  const subject = bookingThreadSubject(bookingNo);
  const messageId = bookingThreadMessageId(bookingNo);
  const html = emailShell(`
    <p style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 16px;">English</p>
    <h2 style="color: #16a34a; margin-top: 0;">Booking request submitted</h2>
    <p>Dear User,</p>
    <p>We have received your space reservation request. Details:</p>
    <ul>
      <li><strong>Booking No.:</strong> ${bookingNo}</li>
      <li><strong>Room / Space:</strong> ${roomName}</li>
      <li><strong>Date:</strong> ${dateEn}</li>
      <li><strong>Time slot:</strong> ${slotEn}</li>
      <li><strong>Status:</strong> Pending approval</li>
    </ul>
    <p>Please wait for review and approval by MFU Property Management.</p>
    ${langDivider}
    <h2 style="color: #16a34a; margin-top: 0;">ส่งคำขอจองห้องเรียบร้อยแล้ว</h2>
    <p>เรียน คุณผู้ใช้,</p>
    <p>ระบบได้รับการจองห้องของคุณเรียบร้อยแล้ว รายละเอียดมีดังนี้:</p>
    <ul>
      <li><strong>รหัสการจอง:</strong> ${bookingNo}</li>
      <li><strong>ห้อง/พื้นที่:</strong> ${roomName}</li>
      <li><strong>วันที่จอง:</strong> ${dateTh}</li>
      <li><strong>ช่วงเวลา:</strong> ${slotTh}</li>
      <li><strong>สถานะ:</strong> รอการอนุมัติ (Pending)</li>
    </ul>
    <p>กรุณารอการตรวจสอบและอนุมัติจากเจ้าหน้าที่บริหารจัดการทรัพย์สิน มฟล.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 12px; color: #888;">Temporary Space Rental Management System · Mae Fah Luang University<br/>ระบบบริหารจัดการพื้นที่เช่าชั่วคราว มหาวิทยาลัยแม่ฟ้าหลวง</p>
  `);
  return sendEmail({ to: userEmail, subject, html, messageId });
}

export async function sendBookingStatusEmail(
  userEmail: string,
  bookingNo: string,
  roomName: string,
  status: string,
  remarks?: string,
  bookingDate?: string,
  timeSlot?: string,
  threadId?: string
): Promise<SendEmailResult> {
  const { textTh, textEn, color, approved } = statusLabelForEmail(status);
  const reason = String(remarks || "").trim();
  const slotTh = timeSlotLabelTh(String(timeSlot || ""));
  const slotEn = timeSlotLabelEn(String(timeSlot || ""));
  const dateTh = formatBookingDateTh(bookingDate);
  const dateEn = formatBookingDateEn(bookingDate);
  const rootId = normalizeMessageId(threadId) || bookingThreadMessageId(bookingNo);
  const subject = bookingReplySubject(bookingNo);

  let reasonBlockEn = "";
  let reasonBlockTh = "";
  if (!approved) {
    reasonBlockEn = reason
      ? `<p style="margin-top: 16px; padding: 12px; background: #fef2f2; border-left: 4px solid #dc2626;">
           <strong>Reason for disapproval:</strong><br/>${reason}
         </p>`
      : `<p style="margin-top: 16px; padding: 12px; background: #fef2f2; border-left: 4px solid #dc2626;">
           <strong>Reason for disapproval:</strong> Not specified
         </p>`;
    reasonBlockTh = reason
      ? `<p style="margin-top: 16px; padding: 12px; background: #fef2f2; border-left: 4px solid #dc2626;">
           <strong>เหตุผลที่ไม่อนุมัติ:</strong><br/>${reason}
         </p>`
      : `<p style="margin-top: 16px; padding: 12px; background: #fef2f2; border-left: 4px solid #dc2626;">
           <strong>เหตุผลที่ไม่อนุมัติ:</strong> ไม่ระบุเหตุผล
         </p>`;
  } else if (reason) {
    reasonBlockEn = `<p><strong>Additional remarks:</strong> ${reason}</p>`;
    reasonBlockTh = `<p><strong>หมายเหตุเพิ่มเติม:</strong> ${reason}</p>`;
  }

  const nextStepEn = approved
    ? status === "approved_pending_payment" || status === "approved"
      ? `<p>You can sign in to your dashboard to pay the service fee.</p>`
      : ""
    : `<p>If you have questions, please contact MFU Property Management.</p>`;
  const nextStepTh = approved
    ? status === "approved_pending_payment" || status === "approved"
      ? `<p>คุณสามารถเข้าสู่ระบบที่แดชบอร์ดเพื่อชำระเงินค่าบริการได้</p>`
      : ""
    : `<p>หากมีข้อสงสัย กรุณาติดต่อเจ้าหน้าที่บริหารจัดการทรัพย์สิน มฟล.</p>`;

  const html = emailShell(`
    <p style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 16px;">English</p>
    <h2 style="color: ${color}; margin-top: 0;">Booking decision: ${textEn}</h2>
    <p>Dear User,</p>
    <p>Your booking <strong>${bookingNo}</strong> for <strong>${roomName}</strong> has been reviewed.</p>
    <ul>
      <li><strong>Date:</strong> ${dateEn}</li>
      <li><strong>Time slot:</strong> ${slotEn}</li>
      <li><strong>Current status:</strong> <span style="color: ${color}; font-weight: bold;">${textEn}</span></li>
    </ul>
    ${reasonBlockEn}
    ${nextStepEn}
    ${langDivider}
    <h2 style="color: ${color}; margin-top: 0;">ผลการพิจารณาคำขอจองห้อง: ${textTh}</h2>
    <p>เรียน คุณผู้ใช้,</p>
    <p>คำขอจองห้องรหัส <strong>${bookingNo}</strong> สำหรับห้อง <strong>${roomName}</strong> ได้รับการพิจารณาเรียบร้อยแล้ว</p>
    <ul>
      <li><strong>วันที่จอง:</strong> ${dateTh}</li>
      <li><strong>ช่วงเวลา:</strong> ${slotTh}</li>
      <li><strong>สถานะปัจจุบัน:</strong> <span style="color: ${color}; font-weight: bold;">${textTh}</span></li>
    </ul>
    ${reasonBlockTh}
    ${nextStepTh}
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 12px; color: #888;">Temporary Space Rental Management System · Mae Fah Luang University<br/>ระบบบริหารจัดการพื้นที่เช่าชั่วคราว มหาวิทยาลัยแม่ฟ้าหลวง</p>
  `);
  return sendEmail({ to: userEmail, subject, html, ...threadHeaders(rootId) });
}

export async function sendPaymentApprovedWithPermitEmail(
  userEmail: string,
  bookingNo: string,
  roomName: string,
  pdfBuffer: Buffer,
  bookingDate?: string,
  timeSlot?: string,
  threadId?: string
): Promise<SendEmailResult> {
  const slotTh = timeSlotLabelTh(String(timeSlot || ""));
  const slotEn = timeSlotLabelEn(String(timeSlot || ""));
  const dateTh = formatBookingDateTh(bookingDate);
  const dateEn = formatBookingDateEn(bookingDate);
  const rootId = normalizeMessageId(threadId) || bookingThreadMessageId(bookingNo);
  const subject = bookingReplySubject(bookingNo);
  const html = emailShell(`
    <p style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 16px;">English</p>
    <h2 style="color: #16a34a; margin-top: 0;">Payment confirmed</h2>
    <p>Dear User,</p>
    <p>Payment for booking <strong>${bookingNo}</strong> (${roomName}) has been verified.</p>
    <ul>
      <li><strong>Date:</strong> ${dateEn}</li>
      <li><strong>Time slot:</strong> ${slotEn}</li>
    </ul>
    <p>Please find the attached <strong>Space Permit &amp; Official Receipt</strong>. Keep it as proof of access.</p>
    ${langDivider}
    <h2 style="color: #16a34a; margin-top: 0;">ยืนยันการชำระเงินเรียบร้อยแล้ว</h2>
    <p>เรียน คุณผู้ใช้,</p>
    <p>เจ้าหน้าที่ได้ตรวจสอบและยืนยันการชำระเงินสำหรับรายการจอง <strong>${bookingNo}</strong> (${roomName}) เรียบร้อยแล้ว</p>
    <ul>
      <li><strong>วันที่จอง:</strong> ${dateTh}</li>
      <li><strong>ช่วงเวลา:</strong> ${slotTh}</li>
    </ul>
    <p>ระบบได้แนบเอกสาร <strong>"ใบอนุญาตใช้งานพื้นที่และใบเสร็จรับเงิน (Space Permit &amp; Official Receipt)"</strong> มาพร้อมกับอีเมลนี้ กรุณาเก็บไว้เป็นหลักฐานในการเข้าใช้งานพื้นที่</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 12px; color: #888;">Property Management Division · Mae Fah Luang University<br/>ส่วนจัดการทรัพย์สิน มหาวิทยาลัยแม่ฟ้าหลวง</p>
  `);
  return sendEmail({
    to: userEmail,
    subject,
    html,
    ...threadHeaders(rootId),
    attachments: [
      {
        filename: `Permit_Receipt_${bookingNo}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}
