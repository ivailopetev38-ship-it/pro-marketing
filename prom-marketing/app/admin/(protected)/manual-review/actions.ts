"use server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin/require-admin";
import { MANUAL_REVIEW_STATUSES, AGENT_RULE_SCOPES, type AgentRuleScope } from "@/lib/crm/types";
import { createAgentRule } from "@/lib/crm/repository";

const CLOSED = new Set(["resolved", "ignored"]);

/**
 * Реши + Научи: затваря ръчната проверка И записва урок за работника, който
 * той чете всеки цикъл — така не ескалира пак същото. Това е учебният цикъл
 * на ИРП-то, изведен с един бутон в UI-то.
 */
export async function teachAndResolveAction(formData: FormData) {
  const adminEmail = await requireAdmin();
  const id = String(formData.get("item_id") ?? "");
  const lesson = String(formData.get("lesson") ?? "").trim();
  const scopeRaw = String(formData.get("scope") ?? "all");
  const scope = (AGENT_RULE_SCOPES as readonly string[]).includes(scopeRaw) ? (scopeRaw as AgentRuleScope) : "all";
  const title = String(formData.get("title") ?? "").trim() || "Урок от ръчна проверка";
  const status = String(formData.get("status") ?? "resolved");
  if (!id || !lesson) throw new Error("Урокът е задължителен");

  const svc = createServiceClient();
  const { data: item } = await svc.from("manual_review_items").select("type, description").eq("id", id).maybeSingle();

  // 1) Запиши урока като машинно правило.
  await createAgentRule({
    scope,
    title,
    rule: lesson,
    trigger_pattern: String(formData.get("trigger_pattern") ?? "").trim() || undefined,
    source_review_type: (item?.type as string | undefined) ?? undefined,
    source_review_id: id,
    created_by: adminEmail,
  });

  // 2) Затвори проверката + остави следа защо.
  const stamp = new Date().toISOString();
  const closed = CLOSED.has(status) ? status : "resolved";
  await svc
    .from("manual_review_items")
    .update({
      status: closed,
      resolved_at: stamp,
      description: `${item?.description ? item.description + "\n\n" : ""}Урок към ${scope} (${stamp.slice(0, 10)}): ${lesson}`,
    })
    .eq("id", id);

  revalidatePath("/admin/manual-review");
  revalidatePath("/admin/agent-rules");
  revalidatePath("/admin");
}

/** Set the lifecycle status of a manual-review item (open/needs_user/blocked/resolved/ignored). */
export async function resolveManualReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("item_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(MANUAL_REVIEW_STATUSES as readonly string[]).includes(status)) throw new Error("Invalid input");

  const svc = createServiceClient();
  await svc
    .from("manual_review_items")
    // resolved_at is set only for terminal states; re-opening clears it.
    .update({ status, resolved_at: CLOSED.has(status) ? new Date().toISOString() : null })
    .eq("id", id);

  revalidatePath("/admin/manual-review");
  revalidatePath("/admin");
}

/** Link the item (and its invoice, if any) to a contact found by email. */
export async function matchToContactByEmail(formData: FormData) {
  const adminEmail = await requireAdmin();
  const id = String(formData.get("item_id") ?? "");
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  if (!id || !email) throw new Error("Имейл е задължителен");

  const svc = createServiceClient();
  const { data: contact } = await svc.from("contacts").select("id").eq("email", email).maybeSingle();
  if (!contact) throw new Error("Няма контакт с този имейл");

  const { data: item } = await svc.from("manual_review_items").select("*").eq("id", id).single();

  await svc
    .from("manual_review_items")
    .update({ related_contact_id: contact.id, status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", id);

  if (item?.related_invoice_id) {
    await svc.from("invoices").update({ contact_id: contact.id }).eq("id", item.related_invoice_id);
  }
  if (item?.related_payment_id) {
    await svc.from("payments").update({ contact_id: contact.id }).eq("id", item.related_payment_id);
  }

  await svc.from("contact_activities").insert({
    contact_id: contact.id,
    activity_type: "note",
    title: "Свързан от ръчна проверка",
    body: item?.title ?? null,
    created_by: adminEmail,
  });

  revalidatePath("/admin/manual-review");
  revalidatePath(`/admin/clients/${contact.id}`);
  revalidatePath("/admin");
}

/**
 * Масово игнориране на спам наводнението: затваря всички отворени items от
 * тип email_parse_error / ambiguous_pdf (неясни/спам имейли от Пощальона).
 * Бележка с дата остава като одитна следа във всеки запис.
 */
export async function bulkIgnoreEmailNoiseAction() {
  await requireAdmin();
  const svc = createServiceClient();
  const { data } = await svc
    .from("manual_review_items")
    .select("id, description")
    .in("status", ["open", "needs_user"])
    .in("type", ["email_parse_error", "ambiguous_pdf"]);

  const rows = (data ?? []) as Array<{ id: string; description: string | null }>;
  const stamp = new Date().toISOString();
  for (const row of rows) {
    await svc
      .from("manual_review_items")
      .update({
        status: "ignored",
        resolved_at: stamp,
        description: `${row.description ? row.description + "\n\n" : ""}Резолюция (${stamp.slice(0, 10)}): масово почистване — спам/неясни имейли (bulk от админа).`,
      })
      .eq("id", row.id);
  }

  revalidatePath("/admin/manual-review");
  revalidatePath("/admin");
}

/** Schedule a follow-up call on the linked contact (+2 days) and resolve. */
export async function createFollowupFromItem(formData: FormData) {
  const adminEmail = await requireAdmin();
  const id = String(formData.get("item_id") ?? "");
  if (!id) throw new Error("Invalid input");

  const svc = createServiceClient();
  const { data: item } = await svc.from("manual_review_items").select("*").eq("id", id).single();
  if (!item?.related_contact_id) throw new Error("Няма свързан контакт");

  const due = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
  await svc
    .from("contacts")
    .update({ next_followup_at: due, followup_status: "needs_call" })
    .eq("id", item.related_contact_id);
  await svc.from("contact_activities").insert({
    contact_id: item.related_contact_id,
    activity_type: "note",
    title: "Follow-up от ръчна проверка",
    body: item.title,
    created_by: adminEmail,
  });
  await svc
    .from("manual_review_items")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/manual-review");
  revalidatePath(`/admin/clients/${item.related_contact_id}`);
}
