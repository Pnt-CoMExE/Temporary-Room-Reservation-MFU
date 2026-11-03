import path from "path";
import { fileURLToPath } from "url";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { bookingDateKey } from "./dates";

const here = path.dirname(fileURLToPath(import.meta.url));
export const MEMO_PDF = path.join(here, "..", "fixtures", "memo.pdf");
export const APPROVAL_PDF = path.join(here, "..", "fixtures", "approval.pdf");

/** Convert YYYY-MM-DD → DD/MM/YYYY for DateField text input. */
function toDMY(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export async function fillAndSubmitBookingForm(page: Page, opts?: { date?: string }) {
  const date = opts?.date ?? bookingDateKey(45);

  await page.locator('input[type="tel"]').fill("0812345678");
  // DateField is text-only DMY (+ optional calendar); no native type=date
  const dateInput = page.locator('input[placeholder*="วว/ดด"], input[placeholder*="dd/mm"]').first();
  await dateInput.fill(toDMY(date));
  await dateInput.blur();

  const duration = page.locator("select").first();
  // Slots enable only after availability loads; prior E2E runs may have taken morning
  await expect(
    duration.locator(
      'option[value="half_morning"]:not([disabled]), option[value="half_afternoon"]:not([disabled])'
    ).first()
  ).toBeAttached({ timeout: 15000 });
  const morningDisabled = await duration
    .locator('option[value="half_morning"]')
    .isDisabled();
  await duration.selectOption(morningDisabled ? "half_afternoon" : "half_morning");

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
