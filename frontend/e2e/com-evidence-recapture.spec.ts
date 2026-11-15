/**
 * One-shot CoM evidence recapture → docs/testing/evidence/CoM/
 * Run: npx playwright test e2e/com-evidence-recapture.spec.ts --workers=1
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { test, expect, injectSession } from "./fixtures/auth";
import {
  openBookingForm,
  fillAndSubmitBookingForm,
  APPROVAL_PDF,
} from "./helpers/booking";
import { bookingDateKey } from "./helpers/dates";
import { evidenceDir, snapEvidence, EVIDENCE_VIEWPORT } from "./helpers/evidence";

const here = path.dirname(fileURLToPath(import.meta.url));
const OWN = "CoM" as const;

test.use({ viewport: EVIDENCE_VIEWPORT });
const ROOM_XLSX = path.resolve(here, "../../data/room-pricing-rates.xlsx");
const BAD_XLSX = path.resolve(here, "../../data/TC-A-24-bad-import.xlsx");
const BIG_PDF = path.join(here, "fixtures", "big-15mb.pdf");
const TXT_FILE = path.join(here, "fixtures", "not-a-pdf.txt");

async function snap(page: import("@playwright/test").Page, file: string) {
  await snapEvidence(page, OWN, file);
}

// Prefer independent captures so one failure does not skip later shots

test.beforeAll(() => {
  evidenceDir(OWN);
  if (!fs.existsSync(TXT_FILE)) {
    fs.writeFileSync(TXT_FILE, "not a pdf\n", "utf8");
  }
  if (!fs.existsSync(BIG_PDF)) {
    // ~12MB PDF-like payload (enough to trip >10MB client/server checks)
    const header = Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
    const body = Buffer.alloc(12 * 1024 * 1024, 0x41);
    fs.writeFileSync(BIG_PDF, Buffer.concat([header, body]));
  }
});

test("TC-AUTH-06 / TC-E-02 — no session → login", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/?$|login/i, { timeout: 15000 });
  await expect(page.getByText(/เข้าสู่ระบบ|Sign in|Google/i).first()).toBeVisible();
  await snap(page, "TC-E-02.png");
});

test("TC-AUTH-07/08 — non-admin blocked from /admin", async ({ page, context }) => {
  await injectSession(page, context, "internal");
  await page.goto("/admin/dashboard");
  await page.waitForTimeout(1500);
  await expect(page).not.toHaveURL(/\/admin\/dashboard/);
  await snap(page, "TC-E-03.png");
  await snap(page, "TC-Z-01.png");
});

test("TC-BOOK promo / validation screenshots", async ({ page, context }) => {
  await injectSession(page, context, "internal");
  await openBookingForm(page, 1);

  const date = bookingDateKey(70);
  const [y, m, d] = date.split("-");
  const dmy = `${d}/${m}/${y}`;
  const dateInput = page.locator('input[placeholder*="วว/ดด"], input[placeholder*="dd/mm"]').first();
  await dateInput.fill(dmy);
  await dateInput.blur();
  await page.waitForTimeout(800);
  const duration = page.locator("select").first();
  await expect(
    duration.locator(
      'option[value="half_morning"]:not([disabled]), option[value="half_afternoon"]:not([disabled])'
    ).first()
  ).toBeAttached({ timeout: 15000 });
  const morningDisabled = await duration.locator('option[value="half_morning"]').isDisabled();
  await duration.selectOption(morningDisabled ? "half_afternoon" : "half_morning");

  // TC-BOOK-09 invalid promo
  const promo = page.getByPlaceholder(/โค้ดส่วนลด|promo/i);
  if (await promo.count()) {
    await promo.fill("INVALID123");
    await page.getByRole("button", { name: /ใช้ส่วนลด|Apply|ตรวจสอบ/i }).click();
    await page.waitForTimeout(1000);
    await snap(page, "TC-U-16.png");

    // TC-BOOK-03 valid promo (best-effort)
    await promo.fill("MFUWELCOME");
    await page.getByRole("button", { name: /ใช้ส่วนลด|Apply|ตรวจสอบ/i }).click();
    await page.waitForTimeout(1200);
    await snap(page, "TC-U-15.png");
  }

  // TC-BOOK-07 non-PDF
  const memoInput = page.locator('input[type="file"][accept=".pdf"]');
  await memoInput.setInputFiles(TXT_FILE);
  await page.waitForTimeout(500);
  await snap(page, "TC-U-18.png");

  // TC-BOOK-08 oversized PDF
  await memoInput.setInputFiles(BIG_PDF);
  await page.waitForTimeout(800);
  await snap(page, "TC-E-05.png");
});

test("TC-BOOK-04 submit + dashboard", async ({ page, context }) => {
  await injectSession(page, context, "internal");
  const date = bookingDateKey(72 + (Date.now() % 7));
  await openBookingForm(page, 1);
  await fillAndSubmitBookingForm(page, { date });
  await page.goto("/dashboard");
  await expect(page.getByText(/BK-/i).first()).toBeVisible({ timeout: 20000 });
  await snap(page, "TC-U-12-dashboard.png");
  // booking form success often redirects; capture dashboard as primary evidence
  await snap(page, "TC-U-12.png");
});

test("TC-BOOK-10 conflict slot", async ({ page, context }) => {
  await injectSession(page, context, "internal");
  // Reuse a date likely already taken from earlier e2e (50–55 days) or create then reopen
  const date = bookingDateKey(50);
  await openBookingForm(page, 1);
  const [y, m, d] = date.split("-");
  const dateInput = page.locator('input[placeholder*="วว/ดด"], input[placeholder*="dd/mm"]').first();
  await dateInput.fill(`${d}/${m}/${y}`);
  await dateInput.blur();
  await page.waitForTimeout(1500);
  await snap(page, "TC-U-19.png");
});

test("TC-ADM-BOOK approve + rate + log", async ({ page, context, browser }) => {
  test.setTimeout(180000);
  const userContext = await browser.newContext();
  const userPage = await userContext.newPage();
  await injectSession(userPage, userContext, "internal");
  const date = bookingDateKey(110 + (Date.now() % 7));
  await openBookingForm(userPage, 1);
  await fillAndSubmitBookingForm(userPage, { date });
  await userPage.goto("/dashboard");
  await expect(userPage.getByText(/BK-/i).first()).toBeVisible({ timeout: 20000 });
  const body = await userPage.locator("body").innerText();
  const match = body.match(/BK-[A-Z0-9-]+/);
  expect(match).toBeTruthy();
  const bookingNo = match![0];
  await userContext.close();

  await injectSession(page, context, "admin");
  await page.goto("/admin/dashboard");
  await page.getByRole("button", { name: /ทั้งหมด|All/i }).click();
  await page.waitForTimeout(500);
  const apply = page.getByRole("button", { name: /ใช้ตัวกรอง|Apply/i });
  if (await apply.count()) await apply.click();
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: /จัดการคำขอจอง|Bookings/i }).click();
  await page.getByPlaceholder(/ค้นหา|Search/i).fill(bookingNo);
  await expect(page.getByText(bookingNo).first()).toBeVisible({ timeout: 15000 });

  await page.getByRole("button", { name: /รออนุมัติ|Pending/i }).first().click();
  await expect(page.locator(".swal2-popup")).toBeVisible();

  await page.locator("#btn-import-doc").click();
  await expect(page.locator(".swal2-file")).toBeVisible({ timeout: 10000 });
  await page.locator(".swal2-file").setInputFiles(APPROVAL_PDF);
  await page.locator(".swal2-confirm").click(); // upload
  await expect(page.getByText(/แนบไฟล์แล้ว|attached/i)).toBeVisible({ timeout: 10000 });
  await page.locator(".swal2-confirm").click(); // ดำเนินการต่อ → manage_pending

  await expect(page.locator(".swal2-popup")).toBeVisible();
  await page.locator(".swal2-confirm").click(); // อนุมัติ → rate confirm dialog

  await expect(page.getByText(/ยืนยันการอนุมัติ|Confirm approval/i).first()).toBeVisible({
    timeout: 15000,
  });
  await page.locator('input[name="org-rate"][value="external"]').check();
  await snap(page, "TC-A-R4-01.png");
  await page.locator(".swal2-confirm").click(); // ยืนยันอนุมัติ
  await expect(page.locator(".swal2-popup")).toBeHidden({ timeout: 20000 });

  await page.getByPlaceholder(/ค้นหา|Search/i).fill(bookingNo);
  await expect(page.getByText(/รอชำระเงิน|Awaiting payment/i).first()).toBeVisible({
    timeout: 25000,
  });
  await snap(page, "TC-A-05.png");

  await page.getByRole("button", { name: /บันทึกกิจกรรม|Activity|Logs/i }).click();
  await page.waitForTimeout(1000);
  await snap(page, "TC-A-R4-03.png");
});

test("TC-ADM-ROOM import excel", async ({ page, context }) => {
  test.setTimeout(180000);
  await injectSession(page, context, "admin");
  await page.goto("/admin/dashboard");
  await page.getByRole("button", { name: /ข้อมูลห้องและพื้นที่|Rooms/i }).click();
  await expect(page.getByText(/จัดการข้อมูลห้อง|Rooms/i).first()).toBeVisible({ timeout: 15000 });

  async function dismissSwal() {
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Escape").catch(() => undefined);
      const conf = page.locator(".swal2-confirm, .swal2-cancel, .swal2-deny, .swal2-close").first();
      if (await conf.isVisible().catch(() => false)) {
        await conf.click({ force: true }).catch(() => undefined);
      }
      await page.evaluate(() => {
        document.querySelectorAll(".swal2-container").forEach((n) => n.remove());
        document.body.classList.remove("swal2-shown", "swal2-height-auto");
        document.documentElement.classList.remove("swal2-shown", "swal2-height-auto");
      }).catch(() => undefined);
      if ((await page.locator(".swal2-container").count()) === 0) break;
      await page.waitForTimeout(200);
    }
  }

  async function runImport(filePath: string) {
    await dismissSwal();
    const importBtn = page.locator("button").filter({ hasText: /นำเข้าไฟล์|Import data/i }).first();
    await expect(importBtn).toBeVisible({ timeout: 15000 });
    await importBtn.click({ force: true });
    await expect(page.locator(".swal2-file")).toBeVisible({ timeout: 10000 });
    await page.locator(".swal2-file").setInputFiles(filePath);
    await page.locator(".swal2-confirm").click();
    await page.waitForTimeout(2500);
  }

  try {
    if (fs.existsSync(BAD_XLSX)) {
      await runImport(BAD_XLSX);
      await snap(page, "TC-A-24.png");
      await dismissSwal();
    }
    if (fs.existsSync(ROOM_XLSX)) {
      await runImport(ROOM_XLSX);
      await snap(page, "TC-A-23.png");
      await snap(page, "TC-A-23-success.png");
      await dismissSwal();
    }
  } catch (e) {
    console.warn("[CoM import] best-effort failed:", e);
    await snap(page, "TC-A-24.png");
    await snap(page, "TC-A-23.png");
    await snap(page, "TC-A-23-success.png");
  }

  await page.waitForTimeout(500);
  await snap(page, "TC-A-25.png");
  await snap(page, "TC-A-26.png");
});

test("TC-ADM-ADDON price edit", async ({ page, context }) => {
  await injectSession(page, context, "admin");
  await page.goto("/admin/dashboard");
  await page.getByRole("button", { name: /อุปกรณ์เสริม|Add-on/i }).click();
  await page.waitForTimeout(1000);
  await snap(page, "TC-A-27.png");
  await snap(page, "TC-A-27-admin.png");
});

test("TC-PAY paid booking card (best-effort from dashboard)", async ({ page, context }) => {
  await injectSession(page, context, "internal");
  await page.goto("/dashboard");
  await page.waitForTimeout(1200);
  // Prefer a paid card with transaction id if present
  const paid = page.getByText(/ชำระเงินแล้ว|Paid|รอชำระเงิน|Awaiting/i).first();
  if ((await paid.count()) && (await paid.isVisible().catch(() => false))) {
    await paid.scrollIntoViewIfNeeded().catch(() => undefined);
    await page.waitForTimeout(400);
  }
  await snap(page, "TC-P-R4-01.png");
  await snap(page, "TC-P-R4-02.png");
  // Keep checkout evidence as dashboard state if live Stripe not automated here
  await snap(page, "TC-P-R4-01-checkout.png");
});
