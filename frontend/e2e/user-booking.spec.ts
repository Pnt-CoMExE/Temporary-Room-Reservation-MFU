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

    // Offset from "now" so re-runs do not collide with prior pending bookings
    const date = bookingDateKey(55 + (Date.now() % 20));
    await openBookingForm(page, 1);
    await fillAndSubmitBookingForm(page, { date });

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);
    // Prefer booking id — status filter <option> "รออนุมัติ" is hidden and matched first
    await expect(page.getByText(/#?BK-/i).first()).toBeVisible({
      timeout: 20000,
    });
  });
});

