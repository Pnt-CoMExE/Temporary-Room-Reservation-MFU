# 5. Payment — ชำระเงิน

**เฟส:** ผู้ใช้  ·  **จำนวน:** 3 เคส

> Stripe checkout + Transaction ID · Mock Sandbox

ตารางรวมทุกโฟลว์: [`../TEST_CASE_TRACKER.md`](../TEST_CASE_TRACKER.md)  ·  แผนที่รหัสเก่า: [`_id-map.md`](./_id-map.md)

| ผล | ความหมาย |
|----|----------|
| ✅ | ผ่าน |
| ❌ | ไม่ผ่าน |
| ⬜ | ยังไม่ทดสอบ |

## Stripe

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน | หมายเหตุ |
|-----|---------|------|---------|---------|----|---------|----------|
| TC-PAY-01 | ชำระผ่าน Stripe checkout | `/dashboard` | `PAYMENT_PROVIDER=stripe` → ชำระ → checkout → callback | สถานะชำระแล้ว (`approved_paid`) | ✅ | `evidence/CoM/TC-P-R4-01.png` |  |
| TC-PAY-02 | อ่าน Transaction ID หลัง callback | `/dashboard` | ต่อจาก TC-PAY-01 | มี Tx ID + สถานะจ่ายแล้ว | ✅ | `evidence/CoM/TC-P-R4-02.png` |  |

## Mock (UAT ไม่ตัดบัตร)

| TC# | ชื่อเคส | หน้า | ขั้นตอน | คาดหวัง | ผล | หลักฐาน | หมายเหตุ |
|-----|---------|------|---------|---------|----|---------|----------|
| TC-PAY-03 | จำลองชำระ Mock Sandbox | `/dashboard` | `PAYMENT_PROVIDER=mock_sandbox` → จำลองชำระ | อัปเดตสถานะโดยไม่โอนจริง | ✅ | `evidence/Parttime/TC-U-24b.png` |  |

---

← [ดัชนีโฟลว์](./README.md)
