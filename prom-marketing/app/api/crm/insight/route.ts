import { NextResponse } from "next/server";
import { z } from "zod";
import { checkHermesAuth } from "@/lib/crm/auth";
import { insightInputSchema, INSIGHT_STATUSES, INSIGHT_CATEGORIES, INSIGHT_SOURCES } from "@/lib/crm/types";
import { upsertInsight, setInsightStatus } from "@/lib/crm/repository";
import { clampLimit, parseOffset, parseCsv, listInsights } from "@/lib/crm/list-read";

export const dynamic = "force-dynamic";

/**
 * POST /api/crm/insight — записва препоръка в таблото „Оптимизация".
 * Ползва се от Hermes Одитора (нощем) и от седмичния облачен одит на Claude.
 * Идемпотентна по dedupe_key за отворени записи.
 */
export async function POST(request: Request) {
  if (!checkHermesAuth(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const raw = await request.json().catch(() => null);
  const parsed = insightInputSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }
  const result = await upsertInsight(parsed.data);
  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: result.id, created: result.created });
}

/**
 * GET /api/crm/insight — списък препоръки (high→low, после най-новите).
 * ?status=new,in_progress&category=accounting&source=claude_weekly&limit=&offset=
 */
export async function GET(request: Request) {
  if (!checkHermesAuth(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const p = new URL(request.url).searchParams;
  const status = parseCsv(p.get("status"), INSIGHT_STATUSES);
  if (status?.length === 0) return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
  const category = parseCsv(p.get("category"), INSIGHT_CATEGORIES);
  if (category?.length === 0) return NextResponse.json({ error: "Invalid category filter" }, { status: 400 });
  const source = parseCsv(p.get("source"), INSIGHT_SOURCES);
  if (source?.length === 0) return NextResponse.json({ error: "Invalid source filter" }, { status: 400 });

  const limit = clampLimit(p.get("limit"));
  const offset = parseOffset(p.get("offset"));
  const r = await listInsights({
    status: status ?? undefined,
    category: category ?? undefined,
    source: source ?? undefined,
    limit,
    offset,
  });
  if (r.error) return NextResponse.json({ ok: false, error: r.error }, { status: 500 });
  return NextResponse.json({ ok: true, total: r.total, count: r.items.length, limit, offset, items: r.items });
}

const patchSchema = z.object({ id: z.string().uuid(), status: z.enum(INSIGHT_STATUSES) });

/** PATCH /api/crm/insight — смяна на статус (new/in_progress/done/dismissed). */
export async function PATCH(request: Request) {
  if (!checkHermesAuth(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const raw = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }
  const result = await setInsightStatus(parsed.data);
  if (result.error === "insight not found") {
    return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
  }
  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: parsed.data.id, status: parsed.data.status });
}
