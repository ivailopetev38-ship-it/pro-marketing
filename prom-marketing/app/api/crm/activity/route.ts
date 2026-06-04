import { NextResponse } from "next/server";
import { checkHermesAuth } from "@/lib/crm/auth";
import { activityInputSchema } from "@/lib/crm/types";
import { recordActivity } from "@/lib/crm/repository";

export const dynamic = "force-dynamic";

/**
 * POST /api/crm/activity — Hermes Gmail→CRM write.
 * Find-or-create a contact, optionally log an idempotent activity, and patch
 * sales follow-up fields (stage, followup_status, next_followup_at, mark_heard).
 */
export async function POST(request: Request) {
  if (!checkHermesAuth(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const raw = await request.json().catch(() => null);
  const parsed = activityInputSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const result = await recordActivity(parsed.data);
  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    contact_id: result.contact_id,
    activity_id: result.activity_id,
    created: result.created,
  });
}
