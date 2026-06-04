import crypto from "node:crypto";

// Meta signs webhook payloads with HMAC-SHA256 using the App Secret.
// The header value is `sha256=<hex>`. We verify in constant time.

export function verifyMessengerSignature(
  rawBody: string,
  header: string | null,
  appSecret: string
): boolean {
  if (!header) return false;
  const [scheme, signature] = header.split("=");
  if (scheme !== "sha256" || !signature) return false;
  const expected = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  if (signature.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
