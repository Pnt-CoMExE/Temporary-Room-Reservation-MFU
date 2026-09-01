import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ page, context }, use) => {
    await context.addCookies([
      {
        name: "mfu_token",
        value: process.env.E2E_USER_TOKEN || "",
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
      localStorage.setItem("userName", "E2E Test User");
      localStorage.setItem("userEmail", "e2e.test@mfu.ac.th");
    });
    await use(page);
  },
});

export { expect };
