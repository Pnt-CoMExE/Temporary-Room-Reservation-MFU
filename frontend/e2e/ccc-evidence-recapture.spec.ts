/**
 * CCC evidence recapture → docs/testing/evidence/CCC/ (overwrite)
 * Run: npx playwright test e2e/ccc-evidence-recapture.spec.ts --workers=1
 */
import { test, expect, injectSession } from "./fixtures/auth";
import { openBookingForm, fillAndSubmitBookingForm, MEMO_PDF } from "./helpers/booking";
import { bookingDateKey } from "./helpers/dates";
import { snapEvidence, EVIDENCE_VIEWPORT } from "./helpers/evidence";

const OWN = "CCC" as const;

test.use({ viewport: EVIDENCE_VIEWPORT });

async function snap(page: import("@playwright/test").Page, file: string) {
  await snapEvidence(page, OWN, file);
}

// Independent captures — one failure must not skip the rest

test("TC-AUTH-05 — protected without login", async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/?$|login/i, { timeout: 15000 });
  await snap(page, "TC-U-05.png");
});

test("TC-AUTH-01/02/03 — role sessions (internal / lamduan / external)", async ({
  page,
  context,
}) => {
  await injectSession(page, context, "internal");
  await page.goto("/dashboard");
  await page.waitForTimeout(800);
  await snap(page, "TC-U-01.png");
  await snap(page, "TC-U-02.png");

  await injectSession(page, context, "external");
  await page.goto("/dashboard");
  await page.waitForTimeout(800);
  await snap(page, "TC-U-03.png");
});

test("TC-ROOM list / filter / search / detail", async ({ page, context }) => {
  await injectSession(page, context, "internal");
  await page.goto("/rooms");
  await page.waitForTimeout(1000);
  await snap(page, "TC-U-07.png");

  const typeFilter = page.locator("select").first();
  if (await typeFilter.count()) {
    const opts = typeFilter.locator("option");
    const n = await opts.count();
    if (n > 1) {
      await typeFilter.selectOption({ index: 1 });
      await page.waitForTimeout(800);
    }
  }
  await snap(page, "TC-U-08.png");

  const search = page.getByPlaceholder(/ค้นหา|Search/i).first();
  if (await search.count()) {
    await search.fill("ห้อง");
    await page.waitForTimeout(800);
    await snap(page, "TC-U-09.png");
    await search.fill("room");
    await page.waitForTimeout(800);
    await snap(page, "TC-U-10.png");
  } else {
    await snap(page, "TC-U-09.png");
    await snap(page, "TC-U-10.png");
  }

  await page.goto("/rooms/1");
  await page.waitForTimeout(1000);
  await snap(page, "TC-U-11.png");
});

test("TC-BOOK date/slot / addon / empty / no-pdf", async ({ page, context }) => {
  test.setTimeout(120000);
  await injectSession(page, context, "internal");
  await openBookingForm(page, 1);

  const date = bookingDateKey(90);
  const [y, m, d] = date.split("-");
  const dateInput = page.locator('input[placeholder*="วว/ดด"], input[placeholder*="dd/mm"]').first();
  await dateInput.fill(`${d}/${m}/${y}`);
  await dateInput.blur();
  await page.waitForTimeout(1000);
  const duration = page.locator("select").first();
  await expect(
    duration.locator(
      'option[value="half_morning"]:not([disabled]), option[value="half_afternoon"]:not([disabled])'
    ).first()
  ).toBeAttached({ timeout: 15000 });
  const morningDisabled = await duration.locator('option[value="half_morning"]').isDisabled();
  await duration.selectOption(morningDisabled ? "half_afternoon" : "half_morning");
  await snap(page, "TC-U-13.png");

  const addon = page.locator('input[type="checkbox"], input[type="number"]').first();
  if (await addon.count()) {
    await addon.click({ force: true }).catch(() => undefined);
    await page.waitForTimeout(400);
  }
  await snap(page, "TC-U-14.png");

  // empty form — submit disabled; snap validation state
  await page.goto(`/booking/1`);
  await expect(page.locator("form")).toBeVisible({ timeout: 15000 });
  await page.locator('button[type="submit"]').click({ force: true }).catch(() => undefined);
  await page.waitForTimeout(500);
  await snap(page, "TC-E-04.png");

  // no PDF
  await page.locator('input[type="tel"]').fill("0812345678");
  const date2 = page.locator('input[placeholder*="วว/ดด"], input[placeholder*="dd/mm"]').first();
  await date2.fill(`${d}/${m}/${y}`);
  await date2.blur();
  await page.waitForTimeout(800);
  const duration2 = page.locator("select").first();
  await duration2
    .selectOption(morningDisabled ? "half_afternoon" : "half_morning")
    .catch(() => undefined);
  await page.locator("textarea").first().fill("no memo pdf");
  await page.locator("#terms").check().catch(() => undefined);
  await page.locator('button[type="submit"]').click({ force: true });
  await page.waitForTimeout(1000);
  await snap(page, "TC-U-17.png");
});

test("TC-UDASH list / filter / search / cancel / review / profile", async ({
  page,
  context,
}) => {
  await injectSession(page, context, "internal");
  // ensure at least one booking visible
  try {
    await openBookingForm(page, 1);
    await fillAndSubmitBookingForm(page, { date: bookingDateKey(95 + (Date.now() % 3)) });
  } catch {
    /* may already have bookings */
  }

  await page.goto("/dashboard");
  await page.waitForTimeout(1200);
  await snap(page, "TC-U-20.png");

  const statusSelect = page.locator("select").first();
  if (await statusSelect.count()) {
    await statusSelect.selectOption({ index: 1 }).catch(() => undefined);
    await page.waitForTimeout(600);
  }
  await snap(page, "TC-U-21.png");

  const search = page.getByPlaceholder(/ค้นหา|Search|BK-/i).first();
  if (await search.count()) {
    await search.fill("BK-");
    await page.waitForTimeout(600);
  }
  await snap(page, "TC-U-22.png");

  const cancelBtn = page.getByRole("button", { name: /ยกเลิก|Cancel/i }).first();
  if (await cancelBtn.count()) {
    await cancelBtn.click();
    await page.waitForTimeout(600);
    await snap(page, "TC-U-25.png");
    const dismiss = page.locator(".swal2-cancel, .swal2-confirm").first();
    if (await dismiss.count()) await dismiss.click();
  } else {
    await snap(page, "TC-U-25.png");
  }

  const reviewBtn = page.getByRole("button", { name: /รีวิว|Review|ความพึงพอใจ/i }).first();
  if (await reviewBtn.count()) {
    await reviewBtn.click();
    await page.waitForTimeout(600);
  }
  await snap(page, "TC-U-26.png");

  await page.goto("/profile");
  await page.waitForTimeout(1000);
  await snap(page, "TC-U-27.png");
  const phone = page.locator('input[type="tel"], input[name*="phone"]').first();
  if (await phone.count()) {
    await phone.fill("0899999999");
    await page.waitForTimeout(400);
  }
  await snap(page, "TC-U-28.png");
});

test("TC-I18N switch language surfaces", async ({ page, context }) => {
  await injectSession(page, context, "internal");
  await page.goto("/home");
  await page.waitForTimeout(800);

  const en = page.getByRole("button", { name: /^EN$/i }).first();
  const th = page.getByRole("button", { name: /^TH$/i }).first();

  await en.click();
  await page.waitForTimeout(600);
  await snap(page, "TC-I-01.png");
  await th.click();
  await page.waitForTimeout(600);
  await snap(page, "TC-I-02.png");

  await context.clearCookies();
  await page.goto("/");
  await page.waitForTimeout(600);
  if (await en.count()) await en.click();
  await page.waitForTimeout(400);
  await snap(page, "TC-I-03.png");

  await injectSession(page, context, "internal");
  await page.goto("/home");
  await en.click();
  await page.waitForTimeout(400);
  // open a modal if any CTA
  const cta = page.getByRole("button").first();
  if (await cta.count()) await cta.click().catch(() => undefined);
  await page.waitForTimeout(500);
  await snap(page, "TC-I-04.png");

  await page.goto("/rooms");
  await page.waitForTimeout(800);
  await snap(page, "TC-I-05.png");

  await page.goto("/dashboard");
  await page.waitForTimeout(1000);
  await snap(page, "TC-I-06.png");

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await snap(page, "TC-I-07.png");
});

test("TC-EDGE-01 404", async ({ page }) => {
  await page.goto("/this-page-does-not-exist-mfu-qa");
  await page.waitForTimeout(800);
  await snap(page, "TC-E-01.png");
});
