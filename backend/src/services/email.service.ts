export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Console audit log for development/testing environment
    console.log(`[EMAIL SERVICE] Sending email to: ${options.to}`);
    console.log(`[EMAIL SERVICE] Subject: ${options.subject}`);
    console.log(`[EMAIL SERVICE] Content: ${options.html.substring(0, 100)}...`);
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
