import { NextResponse } from "next/server";
import { checkHermesAuth } from "@/lib/crm/auth";
import { recurringServiceInputSchema } from "@/lib/crm/types";
import { upsertRecurringService } from "@/lib/crm/repository";

export const dynamic = "force-dynamic";

/**
 * POST /api/crm/recurring-service — upsert a recurring billing record
 * (GPS/CRM/etc.) by (contact_id, service_type). Supports excluded_from_auto_send
 * so automations skip ended relationships (e.g. Borima Trans after May 2026).
 */
export async function POST(request: Request) {
  if (!checkHermesAuth(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const raw = await request.json().catch(() => null);
  const parsed = recurringServiceInputSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const result = await upsertRecurringService(parsed.data);
  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: result.id, created: result.created });
}
