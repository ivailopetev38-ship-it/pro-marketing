import { NextResponse } from "next/server";
import { checkHermesAuth } from "@/lib/crm/auth";
import { matchPaymentInputSchema } from "@/lib/crm/types";
import { matchPayment } from "@/lib/crm/repository";

export const dynamic = "force-dynamic";

/**
 * POST /api/crm/match-payment — try to settle a payment against an invoice.
 * Enforces the safety rule: never marks an invoice paid on amount alone — needs
 * ≥2 independent signals and a single unambiguous candidate, else manual review.
 */
export async function POST(request: Request) {
  if (!checkHermesAuth(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const raw = await request.json().catch(() => null);
  const parsed = matchPaymentInputSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const result = await matchPayment(parsed.data);
  if (!result.ok) {
    return NextResponse.json(result, { status: 404 });
  }
  return NextResponse.json(result);
}
