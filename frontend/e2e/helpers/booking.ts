import path from "path";
import { fileURLToPath } from "url";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { bookingDateKey } from "./dates";

const here = path.dirname(fileURLToPath(import.meta.url));
export const MEMO_PDF = path.join(here, "..", "fixtures", "memo.pdf");
export const APPROVAL_PDF = path.join(here, "..", "fixtures", "approval.pdf");

export async function fillAndSubmitBookingForm(page: Page, opts?: { date?: string }) {
  const date = opts?.date ?? bookingDateKey(45);

  await page.locator('input[type="tel"]').fill("0812345678");
  await page.locator('input[type="date"]').fill(date);

  const duration = page.locator("select").first();
  await duration.selectOption("half_morning");

  await page.locator("textarea").first().fill("E2E automated booking — QA suite");

  const memoInput = page.locator('input[type="file"][accept=".pdf"]');
  await memoInput.setInputFiles(MEMO_PDF);

  await page.locator("#terms").check();

  await page.locator('button[type="submit"]').click();

  const swalConfirm = page.locator(".swal2-confirm");
  await expect(swalConfirm).toBeVisible({ timeout: 20000 });
  await swalConfirm.click();
}

/** Open booking form directly (skips room detail CTA flakiness). */
export async function openBookingForm(page: Page, roomId = 1) {
  await page.goto(`/booking/${roomId}`);
  await expect(page).toHaveURL(new RegExp(`/booking/${roomId}`), { timeout: 15000 });
  // Must be authenticated — login page would be "/"
  await expect(page.locator("body")).not.toContainText("Sign in with Google");
  await expect(page.locator("form")).toBeVisible({ timeout: 20000 });
}
