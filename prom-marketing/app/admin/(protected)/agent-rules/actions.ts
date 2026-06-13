"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createAgentRule, setAgentRuleActive } from "@/lib/crm/repository";
import { AGENT_RULE_SCOPES, type AgentRuleScope } from "@/lib/crm/types";

function str(v: FormDataEntryValue | null): string | undefined {
  const s = String(v ?? "").trim();
  return s.length > 0 ? s : undefined;
}

function revalidate() {
  revalidatePath("/admin/agent-rules");
  revalidatePath("/admin/manual-review");
}

/** Вкл./изкл. на правило от списъка. */
export async function toggleAgentRuleAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("rule_id"));
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) throw new Error("Invalid input");
  const res = await setAgentRuleActive({ id, active });
  if (res.error) throw new Error(res.error);
  revalidate();
}

/** Ръчно добавяне на правило (без да минава през ръчна проверка). */
export async function createAgentRuleAction(formData: FormData) {
  const adminEmail = await requireAdmin();
  const title = str(formData.get("title"));
  const rule = str(formData.get("rule"));
  if (!title || !rule) throw new Error("Заглавие и урок са задължителни");
  const scopeRaw = str(formData.get("scope")) ?? "all";
  const scope = (AGENT_RULE_SCOPES as readonly string[]).includes(scopeRaw) ? (scopeRaw as AgentRuleScope) : "all";
  const res = await createAgentRule({
    scope,
    title,
    rule,
    trigger_pattern: str(formData.get("trigger_pattern")),
    created_by: adminEmail,
  });
  if (res.error) throw new Error(res.error);
  revalidate();
}
