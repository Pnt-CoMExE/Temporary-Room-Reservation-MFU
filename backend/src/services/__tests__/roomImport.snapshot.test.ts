import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * G4 — แก้ราคา/นำเข้าห้องต้องไม่กระทบ booking เก่า
 * ราคาถูก snapshot ใน bookings.room_price / addons_price / total_price ตอนสร้าง/อนุมัติ
 */
describe("room import must not mutate bookings (price snapshot)", () => {
  const servicePath = path.join(__dirname, "..", "roomImport.service.ts");
  const src = fs.readFileSync(servicePath, "utf8");

  it("importRoomsToDatabase SQL never updates or deletes bookings", () => {
    expect(src).not.toMatch(/UPDATE\s+bookings/i);
    expect(src).not.toMatch(/DELETE\s+FROM\s+bookings/i);
    expect(src).not.toMatch(/INSERT\s+INTO\s+bookings/i);
  });

  it("stale rooms are deactivated instead of hard-deleted", () => {
    expect(src).toMatch(/UPDATE rooms SET is_active = FALSE/i);
    expect(src).not.toMatch(/DELETE\s+FROM\s+rooms/i);
  });

  it("import only touches rooms and room_pricing", () => {
    expect(src).toMatch(/INSERT INTO room_pricing/i);
    expect(src).toMatch(/UPDATE rooms SET/i);
  });
});
