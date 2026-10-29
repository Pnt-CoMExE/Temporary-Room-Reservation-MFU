/** Resolve add-on display image (DB url or local illustration). */
export function resolveAddonImage(
  name?: string | null,
  imageUrl?: string | null
): string {
  if (imageUrl && String(imageUrl).trim()) {
    return String(imageUrl).trim();
  }
  const n = (name || "").toLowerCase();
  if (n.includes("โต๊ะ") || n.includes("table")) return "/images/addons/table.svg";
  if (n.includes("เก้าอี้") || n.includes("chair")) return "/images/addons/chair.svg";
  if (n.includes("โปรเจค") || n.includes("projector") || n.includes("จอ")) {
    return "/images/addons/projector.svg";
  }
  if (n.includes("ไมค์") || n.includes("ไมโคร") || n.includes("mic")) {
    return "/images/addons/mic.svg";
  }
  return "/images/addons/generic.svg";
}
