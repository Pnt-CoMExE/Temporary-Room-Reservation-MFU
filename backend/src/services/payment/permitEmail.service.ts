import { query } from "../../../db";
import { generateBookingPDFReceipt } from "../pdf.service";
import { sendPaymentApprovedWithPermitEmail } from "../email.service";
import { createNotification } from "../notification.service";
import {
  formatBookingDateEn,
  timeSlotLabelEn,
  toReceiptEnglish,
} from "../../utils/bookingFormat";

/**
 * Generate Space Permit PDF and email the booker (same as admin slip verify).
 * Safe to call after a booking is marked paid — failures are logged, not thrown.
 */
export async function sendPaidPermitEmailForBooking(bookingId: number): Promise<boolean> {
  try {
    const bookingRes = await query(
      `SELECT id, booking_no, user_id, room_id, organization_type, booking_date, time_slot,
              room_price, addons_price, total_price, status, payment_status
       FROM bookings WHERE id = $1`,
      [bookingId]
    );
    if (bookingRes.rows.length === 0) return false;

    const booking = bookingRes.rows[0];
    const userRes = await query(
      "SELECT email, firstname, lastname FROM users WHERE id = $1",
      [booking.user_id]
    );
    const roomRes = await query("SELECT name, location FROM rooms WHERE id = $1", [
      booking.room_id,
    ]);

    const user = userRes.rows[0] || {};
    const room = roomRes.rows[0] || {};
    const email = String(user.email || "").trim();
    if (!email) {
      console.warn(`[permitEmail] booking ${booking.booking_no}: no user email`);
      return false;
    }

    const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim();
    const pdfBuffer = await generateBookingPDFReceipt({
      bookingNo: booking.booking_no,
      userName: toReceiptEnglish(fullName, email.split("@")[0] || "Applicant"),
      userEmail: email,
      organizationType: booking.organization_type || "internal",
      roomName: toReceiptEnglish(room.name, "MFU Meeting Space"),
      location: toReceiptEnglish(room.location, "MFU Campus"),
      bookingDate: formatBookingDateEn(booking.booking_date),
      timeSlot: timeSlotLabelEn(String(booking.time_slot || "")),
      roomPrice: Number(booking.room_price || 0),
      addonsPrice: Number(booking.addons_price || 0),
      totalPrice: Number(booking.total_price || 0),
      paymentStatus: "verified",
      paidAt: new Date().toLocaleString("en-GB", { timeZone: "Asia/Bangkok" }),
    });

    await sendPaymentApprovedWithPermitEmail(
      email,
      booking.booking_no,
      room.name || "พื้นที่จอง",
      pdfBuffer,
      booking.booking_date,
      String(booking.time_slot || "")
    );

    await createNotification({
      userId: Number(booking.user_id),
      type: "booking_status",
      title: "ยืนยันการชำระเงินแล้ว",
      body: `รายการ ${booking.booking_no} ชำระเงินสำเร็จ — ตรวจสอบใบอนุญาตในอีเมล`,
      link: "/dashboard",
    });

    return true;
  } catch (err) {
    console.error(`[permitEmail] bookingId=${bookingId}:`, err);
    return false;
  }
}
