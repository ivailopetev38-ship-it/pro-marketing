import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({ token: null as string | null, valid: false }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => (h.token ? { value: h.token } : undefined),
  }),
}));
vi.mock("@/lib/admin/session", () => ({
  ADMIN_COOKIE: "pm_admin",
  verifySession: (t: string | null) => h.valid && !!t,
}));

import { requireAdmin } from "./require-admin";

beforeEach(() => {
  h.token = null;
  h.valid = false;
});

describe("requireAdmin", () => {
  it("throws when there is no session cookie", async () => {
    await expect(requireAdmin()).rejects.toThrow("Unauthorized");
  });

  it("throws when the cookie is present but invalid", async () => {
    h.token = "123.deadbeef";
    h.valid = false;
    await expect(requireAdmin()).rejects.toThrow("Unauthorized");
  });

  it("returns an actor label when the session is valid", async () => {
    h.token = "123.validsig";
    h.valid = true;
    await expect(requireAdmin()).resolves.toBeTruthy();
  });
});
