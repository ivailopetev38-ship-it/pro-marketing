import { NextResponse } from "next/server";
import { z } from "zod";
import { checkHermesAuth } from "@/lib/crm/auth";
import { agentRuleInputSchema, AGENT_RULE_SCOPES } from "@/lib/crm/types";
import { createAgentRule, setAgentRuleActive } from "@/lib/crm/repository";
import { clampLimit, parseOffset, parseBoolParam, listAgentRules } from "@/lib/crm/list-read";

export const dynamic = "force-dynamic";

/** POST /api/crm/agent-rule — записва урок/правило за работниците. */
export async function POST(request: Request) {
  if (!checkHermesAuth(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const raw = await request.json().catch(() => null);
  const parsed = agentRuleInputSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }
  const result = await createAgentRule(parsed.data);
  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: result.id });
}

/**
 * GET /api/crm/agent-rule?scope=postalion&active=true — работниците четат
 * правилата си в началото на всеки цикъл. scope връща <scope> + 'all'.
 */
export async function GET(request: Request) {
  if (!checkHermesAuth(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const p = new URL(request.url).searchParams;
  const scope = p.get("scope") ?? undefined;
  if (scope && !(AGENT_RULE_SCOPES as readonly string[]).includes(scope)) {
    return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
  }
  const limit = clampLimit(p.get("limit"));
  const offset = parseOffset(p.get("offset"));
  const r = await listAgentRules({ scope, active: parseBoolParam(p.get("active")), limit, offset });
  if (r.error) return NextResponse.json({ ok: false, error: r.error }, { status: 500 });
  return NextResponse.json({ ok: true, total: r.total, count: r.items.length, limit, offset, items: r.items });
}

const patchSchema = z.object({ id: z.string().uuid(), active: z.boolean() });

/** PATCH /api/crm/agent-rule — вкл./изкл. на правило. */
export async function PATCH(request: Request) {
  if (!checkHermesAuth(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const raw = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }
  const result = await setAgentRuleActive(parsed.data);
  if (result.error === "rule not found") {
    return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
  }
  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: parsed.data.id, active: parsed.data.active });
}
