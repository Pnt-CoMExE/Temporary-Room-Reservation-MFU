/**
 * Recording 5 Phase E — Excel import evidence (TC-A-23…26)
 * Run: npx playwright test e2e/r5-phase-e-import.spec.ts --headed
 */
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { expect } from "@playwright/test";
import { test, injectSession } from "./fixtures/auth";

const here = path.dirname(fileURLToPath(import.meta.url));
const EVIDENCE = path.resolve(here, "../../docs/testing/evidence/CoM");
const XLSX = path.resolve(here, "../../data/room-pricing-rates.xlsx");
const BAD_XLSX = path.resolve(here, "../../data/TC-A-24-bad-import.xlsx");

test.describe("R5 Phase E — Excel import", () => {
  test.beforeAll(() => {
    fs.mkdirSync(EVIDENCE, { recursive: true });
  });

  test("TC-A-23 / A-25 / A-26 import good template + room list prices", async ({
    page,
    context,
  }) => {
    await injectSession(page, context, "admin");
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin/);

    // Open Rooms tab
    await page.getByRole("button", { name: /ข้อมูลห้องและพื้นที่/ }).click();
    await expect(page.getByText(/จัดการข้อมูลห้องและพื้นที่/)).toBeVisible({
      timeout: 15000,
    });

    // Wait for table rows
    await expect(page.locator("table tbody tr").first()).toBeVisible({
      timeout: 20000,
    });
    const rowCountBefore = await page.locator("table tbody tr").count();
    expect(rowCountBefore).toBeGreaterThan(50);

    await page.screenshot({
      path: path.join(EVIDENCE, "TC-A-25.png"),
      fullPage: false,
    });

    // Spot-check prices for C3-101 (half/full internal often 500/1000)
    const c3101 = page.locator("table tbody tr").filter({ hasText: /C3-101/ });
    await expect(c3101.first()).toBeVisible({ timeout: 10000 });
    const priceCell = await c3101.first().innerText();
    expect(priceCell).toMatch(/500/);
    expect(priceCell).toMatch(/1[,.]?000|1000/);

    await c3101.first().scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(EVIDENCE, "TC-A-26.png"),
      fullPage: false,
    });

    // Import good Excel via SweetAlert file input
    await page.getByRole("button", { name: /นำเข้าไฟล์ข้อมูลใหม่/ }).click();
    const dialog = page.locator(".swal2-popup");
    await expect(dialog).toBeVisible();
    const fileInput = dialog.locator('input[type="file"]');
    await fileInput.setInputFiles(XLSX);

    const importRespPromise = page.waitForResponse(
      (r) =>
        r.url().includes("/api/admin/rooms/import") ||
        r.url().includes("/api/admin/import-rooms"),
      { timeout: 120000 }
    );
    await dialog.getByRole("button", { name: /อัปโหลดและประมวลผล/ }).click();
    const importResp = await importRespPromise;
    expect(importResp.ok(), `import status ${importResp.status()}`).toBeTruthy();
    const body = await importResp.json();
    expect(Number(body.count || 0)).toBeGreaterThan(50);

    const successPopup = page.locator(".swal2-popup");
    await expect(successPopup.locator(".swal2-title")).toContainText(/สำเร็จ/, {
      timeout: 30000,
    });
    await expect(successPopup).toContainText(/รายการ|นำเข้า/);
    await page.screenshot({
      path: path.join(EVIDENCE, "TC-A-23.png"),
      fullPage: false,
    });
    await successPopup.screenshot({
      path: path.join(EVIDENCE, "TC-A-23-success.png"),
    });

    const okBtn = page.locator(".swal2-confirm");
    if (await okBtn.isVisible().catch(() => false)) {
      await okBtn.click();
    }

    await expect(page.locator("table tbody tr").first()).toBeVisible();
    const rowCountAfter = await page.locator("table tbody tr").count();
    expect(rowCountAfter).toBeGreaterThan(50);
  });

  test("TC-A-24 import bad file format", async ({ page, context }) => {
    await injectSession(page, context, "admin");
    await page.goto("/admin/dashboard");
    await page.getByRole("button", { name: /ข้อมูลห้องและพื้นที่/ }).click();
    await expect(page.getByText(/จัดการข้อมูลห้องและพื้นที่/)).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole("button", { name: /นำเข้าไฟล์ข้อมูลใหม่/ }).click();
    const dialog = page.locator(".swal2-popup");
    await expect(dialog).toBeVisible();
    const fileInput = dialog.locator('input[type="file"]');
    await fileInput.setInputFiles(BAD_XLSX);
    await dialog.getByRole("button", { name: /อัปโหลดและประมวลผล/ }).click();

    // Expect validation / error (accept either Swal validation or error toast)
    await expect(
      page.locator(".swal2-validation-message, .swal2-popup").filter({
        hasText: /ผิดพลาด|ไม่พบ|Excel|กรุณา|error|Error/i,
      })
    ).toBeVisible({ timeout: 30000 });

    await page.screenshot({
      path: path.join(EVIDENCE, "TC-A-24.png"),
      fullPage: false,
    });
  });
});
