import { test, expect } from "@playwright/test";

test.describe("MFU Space Reservation E2E Flow", () => {
  test("should render homepage and navigate to room catalog", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/MFU Space Reservation|ระบบจองพื้นที่/i);
  });

  test("should display available rooms list", async ({ page }) => {
    await page.goto("/rooms");
    const heading = page.locator("h1, h2");
    await expect(heading.first()).toBeVisible();
  });
});
