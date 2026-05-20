import crypto from "node:crypto";

export function verifyCalSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string
): boolean {
  if (!signatureHeader) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "hex");
  let b: Buffer;
  try {
    b = Buffer.from(signatureHeader, "hex");
  } catch {
    return false;
  }
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
