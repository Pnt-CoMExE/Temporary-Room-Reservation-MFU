import { vi } from "vitest";

/** Shared Express mock helpers for middleware unit tests */
export function mockReq(overrides: Record<string, any> = {}) {
  return {
    headers: {},
    cookies: {},
    body: {},
    params: {},
    query: {},
    user: undefined,
    ...overrides,
  } as any;
}

export function mockRes() {
  const res: Record<string, any> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as any;
}

export function mockNext() {
  return vi.fn();
}
