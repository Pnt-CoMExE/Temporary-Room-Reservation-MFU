/** Deterministic room image variants when real photos / category images are missing. */
export const DEFAULT_ROOM_IMAGE = "/images/rooms/room-01.svg";

/** Category default photos (user-provided). */
export const ROOM_TYPE_IMAGES: Record<string, string> = {
  "ห้องประชุม": "/images/rooms/meeting.jpg",
  "ห้องสัมมนา": "/images/rooms/seminar.jpg",
  "ห้องบรรยาย": "/images/rooms/lecture.jpg",
};

const ROOM_IMAGE_VARIANTS = [
  "/images/rooms/room-01.svg",
  "/images/rooms/room-02.svg",
  "/images/rooms/room-03.svg",
  "/images/rooms/room-04.svg",
  "/images/rooms/room-05.svg",
  "/images/rooms/room-06.svg",
] as const;

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Pick a stable variant from room id / name / type so cards look different. */
export function roomImageVariant(seed?: string | number | null): string {
  const key = String(seed ?? "room").trim() || "room";
  const idx = hashSeed(key) % ROOM_IMAGE_VARIANTS.length;
  return ROOM_IMAGE_VARIANTS[idx];
}

/** Map room type label → category photo (meeting / seminar / lecture). */
export function roomImageByType(roomType?: string | null): string | null {
  const t = String(roomType || "").trim();
  if (!t) return null;
  if (ROOM_TYPE_IMAGES[t]) return ROOM_TYPE_IMAGES[t];

  const lower = t.toLowerCase();
  if (t.includes("สัมมนา") || lower.includes("seminar")) {
    return ROOM_TYPE_IMAGES["ห้องสัมมนา"];
  }
  if (t.includes("บรรยาย") || lower.includes("lecture")) {
    return ROOM_TYPE_IMAGES["ห้องบรรยาย"];
  }
  if (t.includes("ประชุม") || lower.includes("meeting") || lower.includes("conference") || lower.includes("boardroom")) {
    return ROOM_TYPE_IMAGES["ห้องประชุม"];
  }
  return null;
}

/**
 * Resolve a room image URL for display.
 * Keeps uploads and absolute URLs; uses category photo by `roomType` or `seed` when no real image;
 * otherwise picks a deterministic SVG variant from `seed`.
 */
export function resolveRoomImage(
  url?: string | null,
  seed?: string | number | null,
  roomType?: string | null
): string {
  const value = (url || "").trim();
  if (
    value.startsWith("/uploads/") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  // Real photos under /images/rooms/ (not the generic SVG illustration room-*.svg)
  if (
    value.startsWith("/images/rooms/") &&
    !value.includes("room-") &&
    (value.endsWith(".png") ||
      value.endsWith(".jpg") ||
      value.endsWith(".jpeg") ||
      value.endsWith(".webp"))
  ) {
    return value;
  }

  // Prefer category photo (meeting / seminar / lecture) if matched by type or seed (name)
  const byType =
    roomImageByType(roomType) ||
    roomImageByType(seed != null ? String(seed) : "");
  if (byType) return byType;

  // Otherwise keep the specific SVG illustration if provided
  if (value.startsWith("/images/rooms/") && value.endsWith(".svg")) {
    return value;
  }

  return roomImageVariant(seed ?? value ?? "room");
}
