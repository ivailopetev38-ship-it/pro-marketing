import { describe, it, expect } from "vitest";
import crypto from "node:crypto";
import { verifyCalSignature } from "./verify-webhook";

const SECRET = "test-secret-123";

function sign(body: string, secret = SECRET) {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

describe("verifyCalSignature", () => {
  it("returns true for a matching signature", () => {
    const body = JSON.stringify({ hello: "world" });
    const sig = sign(body);
    expect(verifyCalSignature(body, sig, SECRET)).toBe(true);
  });

  it("returns false for a mismatched signature", () => {
    const body = JSON.stringify({ hello: "world" });
    expect(verifyCalSignature(body, "deadbeef", SECRET)).toBe(false);
  });

  it("returns false for an empty signature", () => {
    expect(verifyCalSignature("body", "", SECRET)).toBe(false);
  });

  it("returns false for a body tampered with after signing", () => {
    const body = JSON.stringify({ hello: "world" });
    const sig = sign(body);
    expect(verifyCalSignature(body + "x", sig, SECRET)).toBe(false);
  });
});
