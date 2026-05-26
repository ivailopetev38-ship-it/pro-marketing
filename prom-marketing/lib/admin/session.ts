import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "pm_admin";
const MAX_AGE_SEC = 30 * 24 * 60 * 60; // 30 days

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET missing or too short");
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/**
 * Build a signed session token: `<issuedAtMs>.<hmac>`.
 * Caller decides where to store it (cookie, header) — we just sign and verify.
 */
export function issueSession(): string {
  const issuedAt = Date.now().toString();
  const sig = sign(issuedAt);
  return `${issuedAt}.${sig}`;
}

export function verifySession(token: string | null | undefined): boolean {
  if (!token) return false;
  const [issuedAtStr, providedSig] = token.split(".");
  if (!issuedAtStr || !providedSig) return false;
  const issuedAt = Number(issuedAtStr);
  if (!Number.isFinite(issuedAt)) return false;
  const ageSec = (Date.now() - issuedAt) / 1000;
  if (ageSec < 0 || ageSec > MAX_AGE_SEC) return false;
  let expected: string;
  try {
    expected = sign(issuedAtStr);
  } catch {
    return false;
  }
  const a = Buffer.from(providedSig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE = COOKIE_NAME;
export const ADMIN_MAX_AGE = MAX_AGE_SEC;
