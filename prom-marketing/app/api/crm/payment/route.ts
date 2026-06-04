import { NextResponse } from "next/server";
import { checkHermesAuth } from "@/lib/crm/auth";
import { paymentInputSchema } from "@/lib/crm/types";
import { upsertPayment } from "@/lib/crm/repository";

export const dynamic = "force-dynamic";

/**
 * POST /api/crm/payment — idempotent payment record (bank statement / email
 * evidence). Does NOT settle any invoice — that is /api/crm/match-payment.
 */
export async function POST(request: Request) {
  if (!checkHermesAuth(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const raw = await request.json().catch(() => null);
  const parsed = paymentInputSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const result = await upsertPayment(parsed.data);
  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: result.id, created: result.created });
}
