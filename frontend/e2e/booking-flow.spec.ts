/**
 * Legacy entry kept for discoverability.
 * Core coverage lives in:
 * - public-smoke.spec.ts
 * - user-booking.spec.ts
 * - admin-approve.spec.ts
 */
import { test, expect } from "@playwright/test";

test.describe("Legacy smoke pointer", () => {
  test("public home still loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });
});
