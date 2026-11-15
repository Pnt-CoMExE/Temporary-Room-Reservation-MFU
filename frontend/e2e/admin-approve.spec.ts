import { test, expect, injectSession } from "./fixtures/auth";
import { openBookingForm, fillAndSubmitBookingForm, APPROVAL_PDF } from "./helpers/booking";
import { bookingDateKey } from "./helpers/dates";

test.describe("Admin approve booking", () => {
  test("approve pending booking after attaching approval doc", async ({
    page,
    context,
    browser,
  }) => {
    test.setTimeout(90_000);
    // 1) Create pending booking as internal user
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    await injectSession(userPage, userContext, "internal");

    // Farther + jitter avoids collisions from prior E2E runs on room 1
    const date = bookingDateKey(95 + (Date.now() % 40));
    await openBookingForm(userPage, 1);
    const created = userPage.waitForResponse(
      (r) =>
        r.url().includes("/api/bookings") &&
        r.request().method() === "POST" &&
        r.status() === 201
    );
    await fillAndSubmitBookingForm(userPage, { date });
    const createJson = await (await created).json();
    const bookingNo = String(createJson.bookingNo || "");
    expect(bookingNo).toMatch(/^BK-/);
    await userContext.close();

    // 2) Admin attaches approval doc and approves
    await injectSession(page, context, "admin");
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Booking date is far ahead — chip "ทั้งหมด" applies filter immediately (no Apply button)
    await page.getByRole("button", { name: /ทั้งหมด/i }).click();
    await page.waitForTimeout(800);

    await page.getByRole("button", { name: /จัดการคำขอจอง/i }).click();
    await page.getByPlaceholder(/ค้นหา|พิมพ์คำค้นหา/i).fill(bookingNo);
    await expect(page.getByText(bookingNo).first()).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /รออนุมัติ/i }).first().click();
    await expect(page.locator(".swal2-popup")).toBeVisible();

    // Open attach-approval flow
    await page.locator("#btn-import-doc").click();
    await expect(page.locator(".swal2-file")).toBeVisible({ timeout: 10000 });
    await page.locator(".swal2-file").setInputFiles(APPROVAL_PDF);
    await page.locator(".swal2-confirm").click(); // อัปโหลดเอกสาร

    // Success → continue → manage modal → approve → rate confirm
    await expect(page.getByText(/แนบไฟล์แล้ว/i)).toBeVisible({ timeout: 10000 });
    await page.locator(".swal2-confirm").click(); // ดำเนินการต่อ

    await expect(page.locator(".swal2-popup")).toBeVisible();
    await page.locator(".swal2-confirm").click(); // อนุมัติ → เปิด modal เลือกเรท

    await expect(page.getByRole("button", { name: /ยืนยันอนุมัติ/i })).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole("button", { name: /ยืนยันอนุมัติ/i }).click();

    await page.getByPlaceholder(/ค้นหา|พิมพ์คำค้นหา/i).fill(bookingNo);
    // Status badge is plain text (not a button) after approve → pending payment
    await expect(page.getByText(/รอชำระเงิน/i).first()).toBeVisible({
      timeout: 20000,
    });
  });
});
