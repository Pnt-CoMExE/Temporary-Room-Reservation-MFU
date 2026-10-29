/**
 * Recording 5 — TC-A-27 (addon price) + TC-A-28 (promo no delete)
 */
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { expect } from "@playwright/test";
import { test, injectSession } from "./fixtures/auth";

const here = path.dirname(fileURLToPath(import.meta.url));
const EVIDENCE_COM = path.resolve(here, "../../docs/testing/evidence/CoM");
const EVIDENCE_JJ = path.resolve(here, "../../docs/testing/evidence/JJ");

test.describe("R5 TC-A-27 / TC-A-28", () => {
  test.beforeAll(() => {
    fs.mkdirSync(EVIDENCE_COM, { recursive: true });
    fs.mkdirSync(EVIDENCE_JJ, { recursive: true });
  });

  test("TC-A-27 admin edits add-on price; booking shows DB price", async ({
    page,
    context,
  }) => {
    await injectSession(page, context, "admin");
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin/);

    await page.getByRole("button", { name: /อุปกรณ์เสริม/ }).click();
    await expect(page.getByText(/อุปกรณ์เสริม \(Add-ons\)/)).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator("table tbody tr").first()).toBeVisible({
      timeout: 15000,
    });

    const firstRow = page.locator("table tbody tr").first();
    const name = (await firstRow.locator("td").first().innerText()).trim();
    const priceInput = firstRow.locator('input[type="number"]');
    const oldPrice = Number(await priceInput.inputValue());
    const newPrice = oldPrice === 999 ? 998 : 999;

    await priceInput.fill(String(newPrice));
    await firstRow.getByRole("button", { name: /บันทึก/ }).click();
    await expect(page.getByText(/บันทึกราคาแล้ว/)).toBeVisible({
      timeout: 10000,
    });

    await page.screenshot({
      path: path.join(EVIDENCE_COM, "TC-A-27-admin.png"),
      fullPage: false,
    });

    // Find an active room id for booking page
    const roomsRes = await page.request.get("/api/rooms");
    expect(roomsRes.ok()).toBeTruthy();
    const rooms = await roomsRes.json();
    const roomId = rooms?.[0]?.id;
    expect(roomId).toBeTruthy();

    await page.goto(`/booking/${roomId}`);
    await expect(page.getByText(new RegExp(name.split("\n")[0].trim()))).toBeVisible({
      timeout: 20000,
    });
    // Price shown as ฿{newPrice}
    await expect(page.getByText(new RegExp(`฿\\s*${newPrice}`))).toBeVisible({
      timeout: 10000,
    });

    await page.screenshot({
      path: path.join(EVIDENCE_COM, "TC-A-27.png"),
      fullPage: false,
    });

    // Restore previous price so UAT data stays stable
    await page.goto("/admin/dashboard");
    await page.getByRole("button", { name: /อุปกรณ์เสริม/ }).click();
    await expect(page.locator("table tbody tr").first()).toBeVisible({
      timeout: 15000,
    });
    const restoreRow = page.locator("table tbody tr").first();
    await restoreRow.locator('input[type="number"]').fill(String(oldPrice));
    await restoreRow.getByRole("button", { name: /บันทึก/ }).click();
    await expect(page.getByText(/บันทึกราคาแล้ว/)).toBeVisible({
      timeout: 10000,
    });
  });

  test("TC-A-28 promo UI has toggle only; DELETE API returns 403", async ({
    page,
    context,
  }) => {
    await injectSession(page, context, "admin");
    await page.goto("/admin/dashboard");
    await page.getByRole("button", { name: /รหัสส่วนลด/ }).click();
    await expect(page.getByText(/รหัสส่วนลด|โปรโม|Promo/i).first()).toBeVisible({
      timeout: 15000,
    });

    // No trash / delete button in promo table actions
    const trashIcons = page.locator(
      'button:has(svg[data-icon="trash"]), button:has(svg[data-icon="trash-alt"]), button:has-text("ลบ")'
    );
    await expect(trashIcons).toHaveCount(0);

    // Toggle should exist
    await expect(
      page.locator('svg[data-icon="toggle-on"], svg[data-icon="toggle-off"]').first()
    ).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: path.join(EVIDENCE_JJ, "TC-A-28.png"),
      fullPage: false,
    });
    await page.screenshot({
      path: path.join(EVIDENCE_COM, "TC-A-28.png"),
      fullPage: false,
    });

    // API DELETE must be rejected
    const listRes = await page.request.get("/api/admin/promocodes");
    expect(listRes.ok()).toBeTruthy();
    const promos = await listRes.json();
    const sampleId = promos?.[0]?.id;
    expect(sampleId).toBeTruthy();

    const delRes = await page.request.delete(`/api/admin/promocodes/${sampleId}`);
    expect(delRes.status()).toBe(403);
    const delBody = await delRes.json();
    expect(String(delBody.message || "")).toMatch(/ลบ|ปิดการใช้งาน/i);
  });
});
