import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export interface BookingReceiptData {
  bookingNo: string;
  userName: string;
  userEmail: string;
  organizationType: string;
  roomName: string;
  location?: string;
  bookingDate: string;
  timeSlot: string;
  objective?: string;
  roomPrice: number;
  addonsPrice: number;
  totalPrice: number;
  paymentStatus: string;
  paidAt?: string;
}

export async function generateBookingPDFReceipt(
  data: BookingReceiptData,
  outputPath?: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        if (outputPath) {
          const dir = path.dirname(outputPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(outputPath, pdfBuffer);
        }
        resolve(pdfBuffer);
      });

      // Header Banner
      doc
        .fillColor("#003366")
        .rect(0, 0, 595.28, 80)
        .fill();

      doc
        .fillColor("#FFFFFF")
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("MAE FAH LUANG UNIVERSITY", 40, 20, { align: "left" });

      doc
        .fontSize(12)
        .font("Helvetica")
        .text("Temporary Rental Space Management System - Space Use Permit & Receipt", 40, 45);

      // Reset text color
      doc.fillColor("#333333");

      // Document Title
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("SPACE PERMIT & OFFICIAL RECEIPT", 40, 105, { align: "center" });

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#666666")
        .text(`Document No: ${data.bookingNo}`, 40, 130, { align: "right" });

      doc.moveDown(1.5);

      // Section 1: Customer & Booking Info
      doc
        .strokeColor("#CCCCCC")
        .lineWidth(1)
        .moveTo(40, 150)
        .lineTo(555, 150)
        .stroke();

      const startY = 165;
      doc
        .fillColor("#003366")
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("RESERVATION & PERMIT DETAILS", 40, startY);

      doc.fontSize(10).font("Helvetica").fillColor("#333333");

      const infoRows = [
        ["Booking Reference:", data.bookingNo, "User Email:", data.userEmail],
        ["Applicant Name:", data.userName, "Organization:", data.organizationType.toUpperCase()],
        ["Reserved Space:", data.roomName, "Location:", data.location || "MFU Campus"],
        ["Reservation Date:", data.bookingDate, "Time Slot:", data.timeSlot.toUpperCase()],
      ];

      let rowY = startY + 25;
      infoRows.forEach(([l1, v1, l2, v2]) => {
        doc.font("Helvetica-Bold").text(l1, 40, rowY, { width: 120 });
        doc.font("Helvetica").text(v1, 160, rowY, { width: 130 });

        doc.font("Helvetica-Bold").text(l2, 300, rowY, { width: 100 });
        doc.font("Helvetica").text(v2, 400, rowY, { width: 155 });
        rowY += 20;
      });

      // Section 2: Pricing Table
      rowY += 15;
      doc
        .fillColor("#003366")
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("PAYMENT SUMMARY", 40, rowY);

      rowY += 20;
      // Table Header Bar
      doc.fillColor("#F0F4F8").rect(40, rowY, 515, 22).fill();
      doc.fillColor("#003366").font("Helvetica-Bold").fontSize(10);
      doc.text("Description", 50, rowY + 6);
      doc.text("Amount (THB)", 430, rowY + 6, { align: "right" });

      rowY += 28;
      doc.fillColor("#333333").font("Helvetica").fontSize(10);
      doc.text(`Room Rental Fee (${data.roomName})`, 50, rowY);
      doc.text(`THB ${data.roomPrice.toFixed(2)}`, 430, rowY, { align: "right" });

      if (data.addonsPrice > 0) {
        rowY += 20;
        doc.text("Equipment & Add-ons Fee", 50, rowY);
        doc.text(`THB ${data.addonsPrice.toFixed(2)}`, 430, rowY, { align: "right" });
      }

      rowY += 25;
      doc.strokeColor("#DDDDDD").moveTo(40, rowY).lineTo(555, rowY).stroke();

      rowY += 10;
      doc.fillColor("#003366").font("Helvetica-Bold").fontSize(12);
      doc.text("TOTAL AMOUNT PAID:", 50, rowY);
      doc.text(`THB ${data.totalPrice.toFixed(2)}`, 400, rowY, { align: "right" });

      // Verification Badge
      rowY += 40;
      doc
        .fillColor("#E6F4EA")
        .rect(40, rowY, 515, 45)
        .fill();

      doc
        .fillColor("#137333")
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("STATUS: PAYMENT VERIFIED & SPACE PERMIT GRANTED", 55, rowY + 14);

      doc
        .fontSize(9)
        .font("Helvetica")
        .text(`Verified at: ${data.paidAt || new Date().toLocaleString()}`, 55, rowY + 30);

      // Official Stamp / Signature Footer
      const footerY = 700;
      doc
        .strokeColor("#CCCCCC")
        .moveTo(350, footerY)
        .lineTo(520, footerY)
        .stroke();

      doc
        .fillColor("#555555")
        .fontSize(9)
        .font("Helvetica")
        .text("Authorized Signature", 350, footerY + 5, { width: 170, align: "center" });

      doc
        .fontSize(9)
        .text("MFU Asset Management Division", 350, footerY + 18, { width: 170, align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
