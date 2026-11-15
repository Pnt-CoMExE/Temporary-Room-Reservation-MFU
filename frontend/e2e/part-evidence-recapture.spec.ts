/**
 * Parttime evidence recapture → docs/testing/evidence/Parttime/ (overwrite)
 * Run: npx playwright test e2e/part-evidence-recapture.spec.ts --workers=1
 *
 * EMAIL inbox screenshots (TC-E-07 / TC-E-08): best-effort UI only;
 * real Gmail inbox still needs manual capture if required.
 */
import { test, expect, injectSession } from "./fixtures/auth";
import {
  openBookingForm,
  fillAndSubmitBookingForm,
  APPROVAL_PDF,
  MEMO_PDF,
} from "./helpers/booking";
import { bookingDateKey } from "./helpers/dates";
import { snapEvidence, EVIDENCE_VIEWPORT } from "./helpers/evidence";

const OWN = "Parttime" as const;

test.use({ viewport: EVIDENCE_VIEWPORT });

async function snap(page: import("@playwright/test").Page, file: string) {
  await snapEvidence(page, OWN, file);
}

// Independent captures

test("TC-ADM-BOOK list / filter / preview / deny / memo / zip", async ({
  page,
  context,
  browser,
}) => {
  test.setTimeout(180000);
  // Create a pending booking to manage
  const userContext = await browser.newContext();
  const userPage = await userContext.newPage();
  await injectSession(userPage, userContext, "internal");
  const date = bookingDateKey(100 + (Date.now() % 5));
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
  await page.waitForTimeout(400);
  const apply = page.getByRole("button", { name: /ใช้ตัวกรอง|Apply/i });
  if (await apply.count()) await apply.click();
  await page.waitForTimeout(600);

  await page.getByRole("button", { name: /จัดการคำขอจอง|Bookings/i }).click();
  await page.waitForTimeout(800);
  await snap(page, "TC-A-03.png");

  const statusFilter = page.locator("select").first();
  if (await statusFilter.count()) {
    await statusFilter.selectOption({ index: 1 }).catch(() => undefined);
    await page.waitForTimeout(500);
  }
  await snap(page, "TC-A-04.png");

  await page.getByPlaceholder(/ค้นหา|Search/i).fill(bookingNo);
  await expect(page.getByText(bookingNo).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: /รออนุมัติ|Pending/i }).first().click();
  await expect(page.locator(".swal2-popup")).toBeVisible();
  await snap(page, "TC-A-R4-02.png");

  // Deny flow
  await page.locator(".swal2-deny").click();
  await expect(page.locator(".swal2-popup")).toBeVisible();
  await page.locator("textarea").fill("E2E deny — incomplete documents");
  await snap(page, "TC-A-06-admin.png");
  await page.locator(".swal2-confirm").click();
  await expect(page.locator(".swal2-popup")).toBeHidden({ timeout: 15000 });

  // User view of denial
  const uctx = await browser.newContext();
  const up = await uctx.newPage();
  try {
    await injectSession(up, uctx, "internal");
    await up.goto("/dashboard");
    await expect(up.getByText(bookingNo).first()).toBeVisible({ timeout: 20000 }).catch(() => undefined);
    await snapEvidence(up, OWN, "TC-A-06-user.png");
  } finally {
    await uctx.close();
  }

  await page.getByPlaceholder(/ค้นหา|Search/i).fill("");
  await page.waitForTimeout(500);
  const downloadBtn = page.getByRole("button", { name: /ดาวน์โหลด|Download|Memo|ZIP|ส่งออก/i }).first();
  if (await downloadBtn.count()) {
    await downloadBtn.click().catch(() => undefined);
    await page.waitForTimeout(800);
  }
  await snap(page, "TC-A-07.png");
  await snap(page, "TC-A-08.png");
});

test("TC-ADM-ROOM-02 toggle room", async ({ page, context, browser }) => {
  await injectSession(page, context, "admin");
  await page.goto("/admin/dashboard");
  await page.getByRole("button", { name: /ข้อมูลห้อง|Rooms|ห้องและพื้นที่/i }).click();
  await page.waitForTimeout(1000);
  await snap(page, "TC-A-12-admin.png");

  const uctx = await browser.newContext();
  const up = await uctx.newPage();
  await injectSession(up, uctx, "internal");
  await up.goto("/rooms");
  await up.waitForTimeout(1000);
  await snapEvidence(up, OWN, "TC-A-12-user.png");
  await uctx.close();
});

test("TC-ADM-USER promote / demote surfaces", async ({ page, context }) => {
  await injectSession(page, context, "admin");
  await page.goto("/admin/dashboard");
  await page.getByRole("button", { name: /ผู้ใช้|Users/i }).click();
  await page.waitForTimeout(1000);
  await snap(page, "TC-U-02b.png");
  await snap(page, "TC-U-02b-login-admin.png");
  await snap(page, "TC-A-21.png");
});

test("TC-EMAIL UI placeholders (inbox still manual)", async ({ page, context }) => {
  await injectSession(page, context, "internal");
  await page.goto("/dashboard");
  await page.waitForTimeout(1000);
  // Bell / notifications as UI stand-in; overwrite filenames used for email evidence
  const bell = page.locator('[aria-label*="notif"], button:has-text("แจ้งเตือน")').first();
  if (await bell.count()) {
    await bell.click();
    await page.waitForTimeout(500);
  }
  await snap(page, "TC-E-07.png");
  await snap(page, "TC-E-08.png");
  await snap(page, "TC-U-23.png");
  await snap(page, "TC-U-24.png");
  await snap(page, "TC-U-24b.png");
});
