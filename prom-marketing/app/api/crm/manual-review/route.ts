import { NextResponse } from "next/server";
import { checkHermesAuth } from "@/lib/crm/auth";
import { manualReviewInputSchema } from "@/lib/crm/types";
import { createManualReviewItem } from "@/lib/crm/repository";

export const dynamic = "force-dynamic";

/** POST /api/crm/manual-review — queue an item for Ivailo (idempotent). */
export async function POST(request: Request) {
  if (!checkHermesAuth(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const raw = await request.json().catch(() => null);
  const parsed = manualReviewInputSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const result = await createManualReviewItem(parsed.data);
  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: result.id, created: result.created });
}
