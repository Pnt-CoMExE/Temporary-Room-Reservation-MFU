/**
 * กำหนด user_type จากอีเมลตามนโยบาย มฟล.
 * - @property.mfu.ac.th → admin (ส่วนทรัพย์สิน)
 * - @mfu.ac.th          → internal (บุคลากรภายใน)
 * - อื่นๆ               → external (คงค่าเดิมถ้ามี หรือ external)
 *
 * Demo/UAT overrides (ปิดใน production จริง):
 * - DEV_ADMIN_EMAILS    → บังคับ admin
 * - DEV_INTERNAL_EMAILS → บังคับ internal
 */
export function resolveUserType(email: string, existingType?: string): string {
  const lower = email.trim().toLowerCase();

  const parseList = (raw: string | undefined) =>
    (raw || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

  const devAdmins = parseList(process.env.DEV_ADMIN_EMAILS);
  if (devAdmins.includes(lower)) return "admin";

  const devInternals = parseList(process.env.DEV_INTERNAL_EMAILS);
  if (devInternals.includes(lower)) return "internal";

  if (lower.endsWith("@property.mfu.ac.th")) return "admin";
  if (lower.endsWith("@mfu.ac.th")) return "internal";

  return existingType || "external";
}
