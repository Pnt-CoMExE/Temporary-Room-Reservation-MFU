/** Deterministic room image variants when real photos are missing. */
export const DEFAULT_ROOM_IMAGE = "/images/rooms/room-01.svg";

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

/**
 * Resolve a room image URL for display.
 * Keeps uploads and absolute URLs; maps known /images paths; otherwise
 * picks a deterministic variant from `seed` (room id/name) so rooms differ.
 */
export function resolveRoomImage(
  url?: string | null,
  seed?: string | number | null
): string {
  const value = (url || "").trim();
  if (
    value.startsWith("/uploads/") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }
  if (value.startsWith("/images/rooms/") && value.endsWith(".svg")) {
    return value;
  }
  // Prefer seed (id/name) so each room stays visually distinct
  return roomImageVariant(seed ?? value ?? "room");
}
