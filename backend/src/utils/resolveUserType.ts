/**
 * กำหนด user_type จากอีเมลตามนโยบาย มฟล.
 * - @property.mfu.ac.th → admin (ส่วนทรัพย์สิน)
 * - @mfu.ac.th          → internal (บุคลากรภายใน)
 * - อื่นๆ               → external (คงค่าเดิมถ้ามี หรือ external)
 *
 * DEV_ADMIN_EMAILS (คั่นด้วย comma) ใช้สำหรับ UAT เมื่อไม่มีอีเมลหน่วยงาน
 */
export function resolveUserType(email: string, existingType?: string): string {
  const lower = email.trim().toLowerCase();

  const devAdmins = (process.env.DEV_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (devAdmins.includes(lower)) return "admin";

  if (lower.endsWith("@property.mfu.ac.th")) return "admin";
  if (lower.endsWith("@mfu.ac.th")) return "internal";

  return existingType || "external";
}
