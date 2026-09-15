import { test, expect, injectSession } from "./fixtures/auth";
import { openBookingForm, fillAndSubmitBookingForm, APPROVAL_PDF } from "./helpers/booking";
import { bookingDateKey } from "./helpers/dates";

test.describe("Admin approve booking", () => {
  test("approve pending booking after attaching approval doc", async ({
    page,
    context,
    browser,
  }) => {
    // 1) Create pending booking as internal user
    const userContext = await browser.newContext();
    const userPage = await userContext.newPage();
    await injectSession(userPage, userContext, "internal");

    const date = bookingDateKey(55);
    await openBookingForm(userPage, 1);
    await fillAndSubmitBookingForm(userPage, { date });
    await userPage.goto("/dashboard");
    await expect(userPage.getByText(/BK-/i).first()).toBeVisible({ timeout: 20000 });
    const bookingIdText = await userPage.locator("body").innerText();
    const match = bookingIdText.match(/BK-[A-Z0-9-]+/);
    expect(match).toBeTruthy();
    const bookingNo = match![0];
    await userContext.close();

    // 2) Admin attaches approval doc and approves
    await injectSession(page, context, "admin");
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Booking date is far ahead — expand dashboard filter beyond "เดือนล่าสุด"
    await page.getByRole("button", { name: /ทั้งหมด/i }).click();
    await page.getByRole("button", { name: /ใช้ตัวกรอง/i }).click();
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

    // Success → continue → manage modal again
    await expect(page.getByText(/แนบไฟล์แล้ว/i)).toBeVisible({ timeout: 10000 });
    await page.locator(".swal2-confirm").click(); // ดำเนินการต่อ

    await expect(page.locator(".swal2-popup")).toBeVisible();
    await page.locator(".swal2-confirm").click(); // อนุมัติ

    await page.getByPlaceholder(/ค้นหา|พิมพ์คำค้นหา/i).fill(bookingNo);
    await expect(page.getByRole("button", { name: /รอชำระเงิน/i }).first()).toBeVisible({
      timeout: 20000,
    });
  });
});
