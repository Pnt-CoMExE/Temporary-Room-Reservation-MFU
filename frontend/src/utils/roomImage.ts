/** Shared fallback when per-room photos are missing from `public/images`. */
export const DEFAULT_ROOM_IMAGE = "/images/room-placeholder.jpg";

/**
 * Resolve a room image URL for display.
 * Keeps uploaded (`/uploads/`) and absolute URLs; everything else uses the shared placeholder
 * until real room photos are available under `public/images`.
 */
export function resolveRoomImage(url?: string | null): string {
  const value = (url || "").trim();
  if (!value) return DEFAULT_ROOM_IMAGE;
  if (
    value.startsWith("/uploads/") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }
  // Seed paths like /images/rooms/*.jpg and legacy room1.jpg are not shipped → placeholder
  return DEFAULT_ROOM_IMAGE;
}
