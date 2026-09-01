import { env } from "../config/env";

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
  bookingDate: string
): Promise<boolean> {
  const subject = `[MFU Space Reservation] ยืนยันการส่งคำขอจองห้อง - ${bookingNo}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #ba0b2f;">ส่งคำขอจองห้องเรียบร้อยแล้ว</h2>
      <p>เรียน คุณผู้ใช้,</p>
      <p>ระบบได้รับการจองห้องของคุณเรียบร้อยแล้ว รายละเอียดมีดังนี้:</p>
      <ul>
        <li><strong>รหัสการจอง:</strong> ${bookingNo}</li>
        <li><strong>ห้อง/พื้นที่:</strong> ${roomName}</li>
        <li><strong>วันที่จอง:</strong> ${bookingDate}</li>
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
  remarks?: string
): Promise<boolean> {
  const isApproved = status === "approved" || status === "approved_paid";
  const statusText = isApproved ? "อนุมัติแล้ว (Approved)" : "ไม่อนุมัติ (Disapproved)";
  const color = isApproved ? "#16a34a" : "#dc2626";

  const subject = `[MFU Space Reservation] แจ้งผลการพิจารณาการจองห้อง - ${bookingNo} [${statusText}]`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: ${color};">ผลการพิจารณาคำขอจองห้อง: ${statusText}</h2>
      <p>เรียน คุณผู้ใช้,</p>
      <p>คำขอจองห้องรหัส <strong>${bookingNo}</strong> สำหรับห้อง <strong>${roomName}</strong> ได้รับการพิจารณาเรียบร้อยแล้ว</p>
      <p><strong>สถานะปัจจุบัน:</strong> <span style="color: ${color}; font-weight: bold;">${statusText}</span></p>
      ${remarks ? `<p><strong>หมายเหตุเพิ่มเติม:</strong> ${remarks}</p>` : ""}
      ${isApproved ? `<p>คุณสามารถเข้าสู่ระบบเพื่อสแกน QR Code ชำระเงินค่าบริการได้ทันทีที่แดชบอร์ด</p>` : ""}
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
  pdfBuffer: Buffer
): Promise<boolean> {
  const subject = `[MFU Space Reservation] ยืนยันการชำระเงินและใบอนุญาตใช้งานพื้นที่ - ${bookingNo}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #16a34a;">ยืนยันการชำระเงินเรียบร้อยแล้ว</h2>
      <p>เรียน คุณผู้ใช้,</p>
      <p>เจ้าหน้าที่ได้ตรวจสอบและยืนยันการชำระเงินสำหรับรายการจอง <strong>${bookingNo}</strong> (${roomName}) เรียบร้อยแล้ว</p>
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
