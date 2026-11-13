/**
 * CoM — email thread evidence (same booking Message-ID → Gmail conversation)
 * Saves UI shots to docs/testing/evidence/CoM/
 * Run: npx playwright test e2e/com-email-thread.spec.ts --workers=1
 *
 * Booker = admin Gmail (comza962) so inbox can show the threaded pair.
 */
import { test, expect, injectSession } from "./fixtures/auth";
import {
  openBookingForm,
  fillAndSubmitBookingForm,
} from "./helpers/booking";
import { bookingDateKey } from "./helpers/dates";
import { snapEvidence } from "./helpers/evidence";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const OWN = "CoM" as const;
const here = path.dirname(fileURLToPath(import.meta.url));
const META = path.resolve(here, "../../docs/testing/evidence/CoM/TC-EMAIL-thread-meta.txt");

async function snap(page: import("@playwright/test").Page, file: string) {
  await snapEvidence(page, OWN, file);
}

test("TC-EMAIL thread — submit + deny → CoM screenshots", async ({
  page,
  context,
  browser,
}) => {
  test.setTimeout(180000);

  // Use admin account (Gmail) as booker so SMTP delivers to the UAT mailbox
  const userContext = await browser.newContext();
  const userPage = await userContext.newPage();
  await injectSession(userPage, userContext, "admin");
  const date = bookingDateKey(120 + (Date.now() % 5));
  await openBookingForm(userPage, 1);
  await fillAndSubmitBookingForm(userPage, { date });
  await userPage.goto("/dashboard");
  await expect(userPage.getByText(/BK-/i).first()).toBeVisible({ timeout: 20000 });
  const body = await userPage.locator("body").innerText();
  const match = body.match(/BK-[A-Z0-9-]+/);
  expect(match).toBeTruthy();
  const bookingNo = match![0];
  await snapEvidence(userPage, OWN, "TC-EMAIL-thread-01-submitted.png");
  await userContext.close();

  // Admin deny (status email should In-Reply-To the submit message)
  await injectSession(page, context, "admin");
  await page.goto("/admin/dashboard");
  await page.getByRole("button", { name: /ทั้งหมด|All/i }).click();
  await page.waitForTimeout(400);
  const apply = page.getByRole("button", { name: /ใช้ตัวกรอง|Apply/i });
  if (await apply.count()) await apply.click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: /จัดการคำขอจอง|Bookings/i }).click();
  await page.getByPlaceholder(/ค้นหา|Search/i).fill(bookingNo);
  await expect(page.getByText(bookingNo).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: /รออนุมัติ|Pending/i }).first().click();
  await expect(page.locator(".swal2-popup")).toBeVisible();
  await page.locator(".swal2-deny").click();
  await expect(page.locator(".swal2-popup")).toBeVisible();
  await page.locator("textarea").fill("E2E email-thread evidence — incomplete documents");
  await snap(page, "TC-EMAIL-thread-02-deny.png");
  await page.locator(".swal2-confirm").click();
  await expect(page.locator(".swal2-popup")).toBeHidden({ timeout: 15000 });
  await page.getByPlaceholder(/ค้นหา|Search/i).fill(bookingNo);
  await expect(page.getByText(/ไม่อนุมัติ|Disapproved/i).first()).toBeVisible({
    timeout: 20000,
  });
  await snap(page, "TC-EMAIL-thread-03-admin-list.png");

  fs.writeFileSync(
    META,
    [
      `bookingNo=${bookingNo}`,
      `date=${new Date().toISOString()}`,
      `note=Open Gmail for comza962 — expect one conversation with submit + deny for ${bookingNo}`,
      `shots=TC-EMAIL-thread-01-submitted.png, TC-EMAIL-thread-02-deny.png, TC-EMAIL-thread-03-admin-list.png`,
      `gmail=TC-EMAIL-thread-04-gmail.png (capture inbox/thread manually or via browser if logged in)`,
    ].join("\n"),
    "utf8"
  );
});
