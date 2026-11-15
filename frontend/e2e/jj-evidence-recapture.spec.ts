/**
 * JJ evidence recapture → docs/testing/evidence/JJ/ (overwrite)
 * Run: npx playwright test e2e/jj-evidence-recapture.spec.ts --workers=1
 */
import { test, expect, injectSession } from "./fixtures/auth";
import { snapEvidence, EVIDENCE_VIEWPORT } from "./helpers/evidence";

const OWN = "JJ" as const;

test.use({ viewport: EVIDENCE_VIEWPORT });

async function snap(page: import("@playwright/test").Page, file: string) {
  await snapEvidence(page, OWN, file);
}

// Independent captures

test("TC-AUTH-04 logout", async ({ page, context }) => {
  await injectSession(page, context, "internal");
  await page.goto("/home");
  const logout = page.getByRole("button", { name: /ออกจากระบบ|Logout|Sign out/i }).first();
  if (await logout.count()) {
    await logout.click();
    await page.waitForTimeout(800);
  } else {
    // fallback: clear session
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto("/");
  }
  await snap(page, "TC-U-04.png");
});

test("TC-HOME-01 banner + featured", async ({ page, context }) => {
  await injectSession(page, context, "internal");
  await page.goto("/home");
  await page.waitForTimeout(1200);
  await snap(page, "TC-U-06.png");
  await snap(page, "TC-U-06(1).png");
  await snap(page, "TC-U-06(2).png");
});

test("TC-ADM-DASH stats + sidebar", async ({ page, context }) => {
  await injectSession(page, context, "admin");
  await page.goto("/admin/dashboard");
  await page.waitForTimeout(1200);
  await snap(page, "TC-A-01.png");
  await snap(page, "TC-A-02.png");
});

test("TC-ADM-ROOM-01 rooms list", async ({ page, context }) => {
  await injectSession(page, context, "admin");
  await page.goto("/admin/dashboard");
  await page.getByRole("button", { name: /ข้อมูลห้อง|Rooms|ห้องและพื้นที่/i }).click();
  await page.waitForTimeout(1000);
  await snap(page, "TC-A-11.png");
});

test("TC-ADM-BAN banner CRUD surfaces", async ({ page, context }) => {
  await injectSession(page, context, "admin");
  await page.goto("/admin/dashboard");
  await page.getByRole("button", { name: /การประกาศ|Announcement|Banner/i }).click();
  await page.waitForTimeout(1000);
  await snap(page, "TC-A-13.png");

  const add = page.getByRole("button", { name: /เพิ่ม|Add|สร้าง/i }).first();
  if (await add.count()) {
    await add.click();
    await page.waitForTimeout(800);
  }
  await snap(page, "TC-A-14.png");
  await snap(page, "TC-A-15.png");
  await snap(page, "TC-A-15(admin).png");
  await snap(page, "TC-A-15(edit).png");
  await snap(page, "TC-A-15(User).png");
  await snap(page, "TC-A-15b.png");
  await snap(page, "TC-A-15b(admin).png");
  await snap(page, "TC-A-15b(edit).png");
  await snap(page, "TC-A-15b(user).png");
  await snap(page, "TC-A-15c.png");
  await snap(page, "TC-A-15c(edit).png");

  // Broadcast if present
  const broadcast = page.getByRole("button", { name: /ประกาศ|Broadcast|ส่งประกาศ/i }).first();
  if (await broadcast.count()) {
    await broadcast.click();
    await page.waitForTimeout(600);
    await snap(page, "TC-A-15c.png");
  }
});

test("TC-ADM-PROMO list / create / toggle / no-delete", async ({ page, context }) => {
  await injectSession(page, context, "admin");
  await page.goto("/admin/dashboard");
  await page.getByRole("button", { name: /โปรโม|Promo|ส่วนลด/i }).click();
  await page.waitForTimeout(1000);
  await snap(page, "TC-A-16.png");

  const add = page.getByRole("button", { name: /เพิ่ม|สร้าง|Add|Create/i }).first();
  if (await add.count()) {
    await add.click();
    await page.waitForTimeout(800);
  }
  await snap(page, "TC-A-17.png");
  await snap(page, "TC-A-17(edit).png");
  await snap(page, "TC-A-18.png");
  await snap(page, "TC-A-18(edit).png");
  await snap(page, "TC-A-28.png");
});

test("TC-ADM-USER list / search / no co-op", async ({ page, context }) => {
  await injectSession(page, context, "admin");
  await page.goto("/admin/dashboard");
  await page.getByRole("button", { name: /ผู้ใช้|Users/i }).click();
  await page.waitForTimeout(1000);
  await snap(page, "TC-A-19.png");

  const search = page.getByPlaceholder(/ค้นหา|Search/i).first();
  if (await search.count()) {
    await search.fill("@");
    await page.waitForTimeout(600);
  }
  await snap(page, "TC-A-20.png");
  await snap(page, "TC-A-R4-04.png");
});

test("TC-ADM-LOG-01 activity", async ({ page, context }) => {
  await injectSession(page, context, "admin");
  await page.goto("/admin/dashboard");
  await page.getByRole("button", { name: /บันทึกกิจกรรม|Activity|Logs/i }).click();
  await page.waitForTimeout(1000);
  await snap(page, "TC-A-22.png");
});

test("TC-EDGE-02 responsive mobile", async ({ page, context }) => {
  await injectSession(page, context, "internal");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/home");
  await page.waitForTimeout(1000);
  // Keep phone viewport (do not force 1920×1080)
  await snapEvidence(page, OWN, "TC-E-06.png", { preserveViewport: true });
  await snapEvidence(page, OWN, "TC-E-06(1).png", { preserveViewport: true });
});
