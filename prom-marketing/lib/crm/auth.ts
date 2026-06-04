import { timingSafeEqual } from "node:crypto";

/**
 * Bearer-token auth for the Hermes-facing /api/crm/* routes.
 *
 * Accepts HERMES_API_TOKEN (preferred, lets you rotate Hermes's key
 * independently) OR INTERNAL_SEND_TOKEN (fallback — the token Hermes already
 * uses for /api/admin/contacts). Constant-time comparison; never logs tokens.
 */
export function checkHermesAuth(request: Request): boolean {
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return false;
  const provided = header.slice(7).trim();
  if (!provided) return false;

  const candidates = [process.env.HERMES_API_TOKEN, process.env.INTERNAL_SEND_TOKEN].filter(
    (t): t is string => typeof t === "string" && t.length > 0
  );
  if (candidates.length === 0) return false;

  const a = Buffer.from(provided);
  return candidates.some((expected) => {
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}
