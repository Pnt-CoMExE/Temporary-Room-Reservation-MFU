import { test, expect } from "@playwright/test";

test.describe("Public smoke", () => {
  test("homepage renders brand / login surface", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/MFU Space Booking|เข้าสู่ระบบ/i);
    await expect(page.locator("body")).toContainText(/MFU|PROPERTY|เข้าสู่ระบบ|Login/i);
  });

  test("rooms list loads", async ({ page }) => {
    await page.goto("/rooms");
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 15000 });
  });

  test("unknown route shows 404 page", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-xyz");
    await expect(page.getByText(/404|ไม่พบหน้า/i).first()).toBeVisible({ timeout: 10000 });
  });
});
