/**
 * กำหนด user_type จากอีเมลตามนโยบาย มฟล.
 * - โดเมนตรงๆ @mfu.ac.th → internal (บุคลากร)
 * - @lamduan.mfu.ac.th / อื่นๆ → external
 * - admin มาจากการ promote ใน Admin UI (เก็บใน DB) เท่านั้น
 *   ไม่ใช้ @property.mfu.ac.th (เมลไม่มีจริง / ไม่ใช้)
 *
 * Demo/UAT overrides (ปิดใน production จริง):
 * - DEV_ADMIN_EMAILS    → บังคับ admin (bootstrap admin คนแรกได้)
 * - DEV_INTERNAL_EMAILS → บังคับ internal
 */
export function resolveUserType(email: string, existingType?: string): string {
  const lower = email.trim().toLowerCase();
  const domain = emailDomain(lower);

  const parseList = (raw: string | undefined) =>
    (raw || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

  const devAdmins = parseList(process.env.DEV_ADMIN_EMAILS);
  if (devAdmins.includes(lower)) return "admin";

  const devInternals = parseList(process.env.DEV_INTERNAL_EMAILS);
  if (devInternals.includes(lower)) return "internal";

  // Admin ที่ถูก promote ไว้แล้วต้องไม่ถูกทับตอน login
  if (existingType === "admin") return "admin";

  // บุคลากร: เฉพาะ @mfu.ac.th ตรงๆ (ไม่รวม lamduan.mfu / property.mfu)
  if (domain === "mfu.ac.th") return "internal";

  return existingType === "internal" ? "internal" : "external";
}

function emailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1) : "";
}
