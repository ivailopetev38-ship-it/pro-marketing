import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { checkHermesAuth } from "./auth";

function req(authHeader?: string) {
  const headers = new Headers();
  if (authHeader !== undefined) headers.set("authorization", authHeader);
  return new Request("https://example.com/api/crm/activity", { method: "POST", headers });
}

describe("checkHermesAuth", () => {
  const prevHermes = process.env.HERMES_API_TOKEN;
  const prevInternal = process.env.INTERNAL_SEND_TOKEN;

  beforeEach(() => {
    delete process.env.HERMES_API_TOKEN;
    delete process.env.INTERNAL_SEND_TOKEN;
  });
  afterEach(() => {
    process.env.HERMES_API_TOKEN = prevHermes;
    process.env.INTERNAL_SEND_TOKEN = prevInternal;
  });

  it("rejects when no tokens are configured", () => {
    expect(checkHermesAuth(req("Bearer anything"))).toBe(false);
  });

  it("rejects a missing Authorization header", () => {
    process.env.INTERNAL_SEND_TOKEN = "secret-token-value";
    expect(checkHermesAuth(req())).toBe(false);
  });

  it("rejects a non-Bearer scheme", () => {
    process.env.INTERNAL_SEND_TOKEN = "secret-token-value";
    expect(checkHermesAuth(req("Basic secret-token-value"))).toBe(false);
  });

  it("accepts the INTERNAL_SEND_TOKEN fallback", () => {
    process.env.INTERNAL_SEND_TOKEN = "secret-token-value";
    expect(checkHermesAuth(req("Bearer secret-token-value"))).toBe(true);
  });

  it("accepts the dedicated HERMES_API_TOKEN", () => {
    process.env.HERMES_API_TOKEN = "hermes-key-123456";
    expect(checkHermesAuth(req("Bearer hermes-key-123456"))).toBe(true);
  });

  it("rejects a wrong token", () => {
    process.env.HERMES_API_TOKEN = "hermes-key-123456";
    expect(checkHermesAuth(req("Bearer wrong-token-000000"))).toBe(false);
  });

  it("rejects an empty bearer value", () => {
    process.env.INTERNAL_SEND_TOKEN = "secret-token-value";
    expect(checkHermesAuth(req("Bearer "))).toBe(false);
  });
});
