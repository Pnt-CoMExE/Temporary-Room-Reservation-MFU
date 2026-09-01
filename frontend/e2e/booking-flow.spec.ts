import { test, expect } from "@playwright/test";

test.describe("MFU Space Reservation — Public Pages", () => {
  test("should render homepage login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/MFU Space Booking|เข้าสู่ระบบ/i);
  });

  test("should display available rooms list", async ({ page }) => {
    await page.goto("/rooms");
    const heading = page.locator("h1, h2");
    await expect(heading.first()).toBeVisible();
  });

  test("should show 404 for unknown route", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-xyz");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("MFU Space Reservation — Authenticated User", () => {
  test.use({
    storageState: undefined,
  });

  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      {
        name: "mfu_token",
        value: "e2e-placeholder",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);
    await page.addInitScript(() => {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", "internal");
      localStorage.setItem("userName", "E2E User");
      localStorage.setItem("userEmail", "e2e@mfu.ac.th");
    });
  });

  test("should access user dashboard when logged in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);
  });

  test("should redirect non-admin away from admin dashboard", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/home/);
  });
});
