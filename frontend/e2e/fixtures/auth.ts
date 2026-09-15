import jwt from "jsonwebtoken";
import { test as base, expect, type Page, type BrowserContext } from "@playwright/test";

export type E2ERole = "internal" | "external" | "admin";

export type SessionInfo = {
  userId: number;
  email: string;
  name: string;
  role: E2ERole;
  token: string;
};

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(
      `Missing ${name}. Set E2E env vars (see docs/QA_AUTOMATION_GUIDE.md).`
    );
  }
  return value;
}

export function mintSession(role: E2ERole): SessionInfo {
  // Do not inherit shell JWT_SECRET — it often differs from backend/.env
  const secret = process.env.E2E_JWT_SECRET || "my_super_secret_key";
  const userId = Number(
    role === "admin"
      ? requireEnv("E2E_ADMIN_ID", "1")
      : requireEnv("E2E_USER_ID", "2")
  );
  if (!Number.isFinite(userId) || userId <= 0) {
    throw new Error("E2E_USER_ID / E2E_ADMIN_ID must be a positive number");
  }

  const email =
    role === "admin"
      ? requireEnv("E2E_ADMIN_EMAIL", "comza962@gmail.com")
      : requireEnv("E2E_USER_EMAIL", "6631501071@lamduan.mfu.ac.th");
  const name = role === "admin" ? "E2E Admin" : "E2E User";

  const token = jwt.sign({ userId, email, role, name }, secret, {
    expiresIn: "8h",
  });

  return { userId, email, name, role, token };
}

function storagePayload(session: SessionInfo) {
  return {
    userId: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
  };
}

export async function injectSession(
  page: Page,
  context: BrowserContext,
  role: E2ERole
): Promise<SessionInfo> {
  const session = mintSession(role);
  const payload = storagePayload(session);
  const origin = process.env.FRONTEND_URL || "http://localhost:5173";

  await context.clearCookies();
  await context.addCookies([
    {
      name: "mfu_token",
      value: session.token,
      url: origin,
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  await page.route("**/api/**", async (route) => {
    const headers = {
      ...route.request().headers(),
      authorization: `Bearer ${session.token}`,
    };
    await route.continue({ headers });
  });

  await page.addInitScript((p) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userId", String(p.userId));
    localStorage.setItem("userRole", p.role);
    localStorage.setItem("userName", p.name);
    localStorage.setItem("userEmail", p.email);
    localStorage.setItem("e2e_bearer", p.token);
  }, { ...payload, token: session.token });

  // Warm origin + re-assert storage (guard against cleared state)
  await page.goto(`${origin}/home`);
  await page.evaluate((p) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userId", String(p.userId));
    localStorage.setItem("userRole", p.role);
    localStorage.setItem("userName", p.name);
    localStorage.setItem("userEmail", p.email);
    localStorage.setItem("e2e_bearer", p.token);
  }, { ...payload, token: session.token });

  // If a 401 raced and bounced us to login, force back after reseeding
  if (page.url().replace(/\/$/, "").endsWith("5173") || /\/$/.test(new URL(page.url()).pathname)) {
    await page.evaluate((p) => {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userId", String(p.userId));
      localStorage.setItem("userRole", p.role);
      localStorage.setItem("userName", p.name);
      localStorage.setItem("userEmail", p.email);
      localStorage.setItem("e2e_bearer", p.token);
    }, { ...payload, token: session.token });
    await page.goto(`${origin}/home`);
  }

  await expect(page).toHaveURL(/\/home|\/admin/, { timeout: 15000 });
  return session;
}

type AuthFixtures = {
  asUser: Page;
  asAdmin: Page;
};

export const test = base.extend<AuthFixtures>({
  asUser: async ({ page, context }, use) => {
    await injectSession(page, context, "internal");
    await use(page);
  },
  asAdmin: async ({ page, context }, use) => {
    await injectSession(page, context, "admin");
    await use(page);
  },
});

export { expect };
