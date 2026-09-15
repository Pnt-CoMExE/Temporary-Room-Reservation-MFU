import { test, expect, injectSession } from "./fixtures/auth";
import { openBookingForm, fillAndSubmitBookingForm } from "./helpers/booking";
import { bookingDateKey } from "./helpers/dates";

test.describe("User booking happy path", () => {
  test("non-admin cannot open admin dashboard", async ({ page, context }) => {
    await injectSession(page, context, "internal");
    await page.goto("/admin/dashboard");
    await expect(page).not.toHaveURL(/\/admin\/dashboard/);
  });

  test("submit booking and see pending on dashboard", async ({ page, context }) => {
    await injectSession(page, context, "internal");

    const date = bookingDateKey(50);
    await openBookingForm(page, 1);
    await fillAndSubmitBookingForm(page, { date });

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);
    await expect(
      page.getByText(/รออนุมัติ|BK-/i).first()
    ).toBeVisible({ timeout: 20000 });
  });
});
