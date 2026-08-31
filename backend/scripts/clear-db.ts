import { query } from "../db";

async function clearDatabase() {
  try {
    console.log("🧹 Clearing rooms and related data...");
    await query("TRUNCATE rooms, room_pricing, bookings, booking_addons RESTART IDENTITY CASCADE");
    console.log("✅ Data cleared successfully!");
  } catch (err) {
    console.error("❌ Error clearing data:", err);
  } finally {
    process.exit();
  }
}

clearDatabase();
