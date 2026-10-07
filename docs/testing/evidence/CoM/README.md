# Evidence — คอม (CoM)

อัปเดต: 2026-10-07 · **เก็บเฉพาะไฟล์รูป + README นี้** · เคสใน `kom.md` ครบ ✅

Booking หลัก: `BK-20261007-N1YS` · เรท external ฿4,800 · Stripe test

## แผนที่รูป → TC

| TC# | รูป | หมายเหตุสั้น |
|-----|-----|----------------|
| TC-U-12 | `TC-U-12.png`, `TC-U-12-dashboard.png` | ส่งจองสำเร็จ → รออนุมัติ |
| TC-U-15 | `TC-U-15.png` | MFUWELCOME ใช้ได้ (ในระบบเป็นส่วนลด **100%** ไม่ใช่ 100 บาท) |
| TC-U-16 | `TC-U-16.png` | INVALID123 → รหัสไม่ถูกต้อง |
| TC-U-18 | `TC-U-18.png` | แนบ .txt → ต้องเป็น PDF |
| TC-U-19 | `TC-U-19.png` | 2026-11-15: เช้า+เต็มวัน `[ไม่ว่าง]` (มีครึ่งเช้าแล้ว) |
| TC-A-05 | `TC-A-05.png` | อนุมัติแล้ว → รอชำระ ฿4,800 |
| TC-A-R4-01 | `TC-A-R4-01.png` | เลือกเรทภายนอก ฿4,800 |
| TC-A-R4-03 | *(ดูหมายเหตุด้านล่าง)* | Log: `internal→external` · ราคา `2400→4800` |
| TC-E-02 | `TC-E-02.png` | ไม่ login → หน้า Login |
| TC-E-03 | `TC-E-03.png` | `/admin` ไม่ login → Login |
| TC-E-05 | `TC-E-05.png` | PDF >10MB → ไฟล์ใหญ่เกินไป |
| TC-P-R4-01 | `TC-P-R4-01.png`, `TC-P-R4-01-checkout.png` | Checkout + สถานะชำระเงินแล้ว |
| TC-P-R4-02 | `TC-P-R4-02.png` | Tx ID: `pi_3UNxD6PR1axRnRPb0cs9FxXS` |
| TC-Z-01 | `TC-Z-01.png` | กัน Admin; API ไม่ auth → 401 |
| TC-Z-02 | *(ไม่มี UI)* | `npm test` → **204/204** ผ่าน (2026-10-07) |

รูปเสริม: `TC-admin-profile-avatar.png`, `TC-admin-bookings.png`

## รายละเอียดที่เคยอยู่ใน .txt (ย้ายมาที่นี่)

**TC-A-R4-03** — `admin_activity_logs`  
`เปลี่ยนเรทราคาการจอง #21` · `เรท: internal→external | ราคาห้อง: 2400→4800 | รวม: 2400.00→4800`

**TC-P-R4-02** — `payments`  
`transaction_id = pi_3UNxD6PR1axRnRPb0cs9FxXS` · amount 4800 · method stripe · status verified

**TC-Z-01 API (ไม่ auth)**  
`/api/user/profile` · `/api/admin/bookings` · `/api/admin/users` → **401**

**TC-Z-02**  
`cd backend && npm test` → 15 files / **204 tests** passed
