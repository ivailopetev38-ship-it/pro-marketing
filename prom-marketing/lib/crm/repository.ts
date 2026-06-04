import { createServiceClient } from "@/lib/supabase/service";
import { evaluatePaymentMatch, invoiceStatusAfterPayment, type MatchConfidence } from "./match";
import type {
  ActivityInput,
  InvoiceInput,
  PaymentInput,
  ManualReviewInput,
  RecurringServiceInput,
  MatchPaymentInput,
  UpsertResult,
} from "./types";

type Sb = ReturnType<typeof createServiceClient>;

// ── shared helper ──────────────────────────────────────────────────────────
async function logActivity(
  sb: Sb,
  args: {
    contact_id: string;
    type: string;
    title: string;
    body?: string | null;
    occurred_at?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  await sb.from("contact_activities").insert({
    contact_id: args.contact_id,
    activity_type: args.type,
    title: args.title,
    body: args.body ?? null,
    occurred_at: args.occurred_at ?? new Date().toISOString(),
    metadata: args.metadata ?? null,
    created_by: "hermes",
  });
}

// ── activity (unified Gmail→CRM / manual write) ─────────────────────────────
export interface ActivityResult {
  contact_id: string | null;
  activity_id: string | null;
  created: boolean;
  error: string | null;
}

export async function recordActivity(input: ActivityInput): Promise<ActivityResult> {
  const sb = createServiceClient();
  const email = input.email?.trim().toLowerCase() || null;
  const phone = input.phone?.trim() || null;
  if (!email && !phone) {
    return { contact_id: null, activity_id: null, created: false, error: "email or phone required" };
  }

  // Find-or-create the contact.
  let existing: { id: string } | null = null;
  if (email) {
    const { data } = await sb.from("contacts").select("id").eq("email", email).maybeSingle();
    existing = data;
  }
  if (!existing && phone) {
    const { data } = await sb.from("contacts").select("id").eq("phone", phone).is("email", null).maybeSingle();
    existing = data;
  }

  let contactId: string;
  if (existing) {
    contactId = existing.id;
  } else {
    const { data, error } = await sb
      .from("contacts")
      .insert({
        full_name: input.full_name ?? null,
        email,
        phone,
        company: input.company ?? null,
        stage: input.stage ?? "lead",
        source: "hermes",
      })
      .select("id")
      .single();
    if (error || !data) {
      return { contact_id: null, activity_id: null, created: false, error: error?.message ?? "insert failed" };
    }
    contactId = data.id;
  }

  // Explicit patches (Hermes overrides; only fields actually provided).
  const patch: Record<string, unknown> = {};
  if (input.full_name) patch.full_name = input.full_name;
  if (input.company !== undefined) patch.company = input.company;
  if (input.stage) patch.stage = input.stage;
  if (input.followup_status) patch.followup_status = input.followup_status;
  if (input.next_followup_at) patch.next_followup_at = input.next_followup_at;
  if (input.mark_heard) patch.last_heard_from_at = new Date().toISOString();
  if (input.notes !== undefined) patch.notes = input.notes;
  if (input.deal_value_eur !== undefined) patch.deal_value_eur = input.deal_value_eur;
  if (Object.keys(patch).length > 0) {
    await sb.from("contacts").update(patch).eq("id", contactId);
  }

  // Optionally log an activity (idempotent on dedupe_key).
  if (!input.activity_type || !input.title) {
    return { contact_id: contactId, activity_id: null, created: false, error: null };
  }
  if (input.dedupe_key) {
    const { data: dup } = await sb
      .from("contact_activities")
      .select("id")
      .eq("contact_id", contactId)
      .eq("activity_type", input.activity_type)
      .contains("metadata", { dedupe_key: input.dedupe_key })
      .maybeSingle();
    if (dup) return { contact_id: contactId, activity_id: dup.id, created: false, error: null };
  }
  const metadata = {
    ...(input.metadata ?? {}),
    ...(input.dedupe_key ? { dedupe_key: input.dedupe_key } : {}),
  };
  const { data: act, error: actErr } = await sb
    .from("contact_activities")
    .insert({
      contact_id: contactId,
      activity_type: input.activity_type,
      title: input.title,
      body: input.body ?? null,
      occurred_at: input.occurred_at ?? new Date().toISOString(),
      metadata,
      created_by: input.created_by ?? "hermes",
    })
    .select("id")
    .single();
  if (actErr) return { contact_id: contactId, activity_id: null, created: false, error: actErr.message };
  return { contact_id: contactId, activity_id: act?.id ?? null, created: true, error: null };
}

// ── invoices ────────────────────────────────────────────────────────────────
async function findExistingInvoice(sb: Sb, input: InvoiceInput): Promise<{ id: string } | null> {
  if (input.source_email_id) {
    const { data } = await sb.from("invoices").select("id").eq("source_email_id", input.source_email_id).maybeSingle();
    if (data) return data;
  }
  if (input.invoice_number) {
    const { data } = await sb
      .from("invoices")
      .select("id")
      .eq("invoice_number", input.invoice_number)
      .eq("invoice_type", input.invoice_type)
      .maybeSingle();
    if (data) return data;
  }
  if (input.dedupe_key) {
    const { data } = await sb.from("invoices").select("id").eq("dedupe_key", input.dedupe_key).maybeSingle();
    if (data) return data;
  }
  return null;
}

export async function upsertInvoice(input: InvoiceInput): Promise<UpsertResult & { contact_id: string | null }> {
  const sb = createServiceClient();

  // Resolve the contact so the invoice shows up on the contact profile.
  let contactId = input.contact_id ?? null;
  if (!contactId && input.client_email) {
    const { data } = await sb.from("contacts").select("id").eq("email", input.client_email.toLowerCase()).maybeSingle();
    if (data) contactId = data.id;
  }

  const existing = await findExistingInvoice(sb, input);
  if (existing) return { id: existing.id, created: false, error: null, contact_id: contactId };

  const status = input.status ?? (input.source === "manual" ? "draft" : "awaiting_payment");
  const row = {
    contact_id: contactId,
    client_name: input.client_name ?? null,
    client_email: input.client_email ?? null,
    invoice_number: input.invoice_number ?? null,
    invoice_type: input.invoice_type,
    issue_date: input.issue_date ?? null,
    due_date: input.due_date ?? null,
    amount_net: input.amount_net ?? null,
    amount_gross: input.amount_gross ?? null,
    vat_amount: input.vat_amount ?? null,
    currency: input.currency,
    service_type: input.service_type ?? null,
    status,
    source: input.source,
    source_email_id: input.source_email_id ?? null,
    source_pdf_name: input.source_pdf_name ?? null,
    recurring_service_id: input.recurring_service_id ?? null,
    notes: input.notes ?? null,
    dedupe_key: input.dedupe_key ?? null,
  };

  const { data, error } = await sb.from("invoices").insert(row).select("id").single();
  if (error || !data) {
    const again = await findExistingInvoice(sb, input);
    if (again) return { id: again.id, created: false, error: null, contact_id: contactId };
    return { id: null, created: false, error: error?.message ?? "insert failed", contact_id: contactId };
  }

  if (contactId) {
    const label = `Фактура ${input.invoice_number ?? ""}`.trim() + ` · ${input.invoice_type}`;
    await logActivity(sb, {
      contact_id: contactId,
      type: "invoice",
      title: label,
      body: input.notes ?? null,
      metadata: { dedupe_key: `invoice:${data.id}`, invoice_id: data.id, amount_gross: input.amount_gross, status },
    }).catch(() => {});
  } else if (input.client_email || input.client_name) {
    // Surface unlinked invoices so they get attached to a profile.
    await createManualReviewItem({
      type: "missing_contact",
      title: `Фактура без контакт: ${input.client_name ?? input.client_email ?? input.invoice_number ?? "?"}`,
      description: `Свържи фактура ${input.invoice_number ?? data.id} към контакт в CRM.`,
      related_invoice_id: data.id,
      severity: "low",
    }).catch(() => {});
  }

  return { id: data.id, created: true, error: null, contact_id: contactId };
}

// ── payments ──────────────────────────────────────────────────────────────
async function findExistingPayment(sb: Sb, input: PaymentInput): Promise<{ id: string } | null> {
  if (input.source_email_id) {
    const { data } = await sb.from("payments").select("id").eq("source_email_id", input.source_email_id).maybeSingle();
    if (data) return data;
  }
  if (input.dedupe_key) {
    const { data } = await sb.from("payments").select("id").eq("dedupe_key", input.dedupe_key).maybeSingle();
    if (data) return data;
  }
  return null;
}

export async function upsertPayment(input: PaymentInput): Promise<UpsertResult> {
  const sb = createServiceClient();

  const existing = await findExistingPayment(sb, input);
  if (existing) return { id: existing.id, created: false, error: null };

  const row = {
    contact_id: input.contact_id ?? null,
    invoice_id: input.invoice_id ?? null,
    amount: input.amount,
    currency: input.currency,
    paid_at: input.paid_at ?? null,
    counterparty_name: input.counterparty_name ?? null,
    payment_reference_redacted: input.payment_reference_redacted ?? null,
    bank_statement_file: input.bank_statement_file ?? null,
    match_confidence: input.match_confidence ?? null,
    match_status: input.match_status,
    source: input.source,
    source_email_id: input.source_email_id ?? null,
    notes: input.notes ?? null,
    dedupe_key: input.dedupe_key ?? null,
  };

  const { data, error } = await sb.from("payments").insert(row).select("id").single();
  if (error || !data) {
    const again = await findExistingPayment(sb, input);
    if (again) return { id: again.id, created: false, error: null };
    return { id: null, created: false, error: error?.message ?? "insert failed" };
  }

  if (input.contact_id) {
    await logActivity(sb, {
      contact_id: input.contact_id,
      type: "payment_received",
      title: `Плащане ${input.amount} ${input.currency}`,
      metadata: { dedupe_key: `payment:${data.id}`, payment_id: data.id, match_status: input.match_status },
    }).catch(() => {});
  }

  return { id: data.id, created: true, error: null };
}

// ── manual review ───────────────────────────────────────────────────────────
export async function createManualReviewItem(input: ManualReviewInput): Promise<UpsertResult> {
  const sb = createServiceClient();
  const dedupe =
    input.dedupe_key ??
    `mr:${input.type}:${input.related_invoice_id ?? "-"}:${input.related_payment_id ?? "-"}:${input.related_contact_id ?? "-"}`;

  const { data: existing } = await sb
    .from("manual_review_items")
    .select("id")
    .eq("dedupe_key", dedupe)
    .eq("status", "open")
    .maybeSingle();
  if (existing) return { id: existing.id, created: false, error: null };

  const { data, error } = await sb
    .from("manual_review_items")
    .insert({
      type: input.type,
      title: input.title,
      description: input.description ?? null,
      related_contact_id: input.related_contact_id ?? null,
      related_invoice_id: input.related_invoice_id ?? null,
      related_payment_id: input.related_payment_id ?? null,
      severity: input.severity,
      status: "open",
      dedupe_key: dedupe,
    })
    .select("id")
    .single();
  if (error || !data) {
    const { data: again } = await sb
      .from("manual_review_items")
      .select("id")
      .eq("dedupe_key", dedupe)
      .eq("status", "open")
      .maybeSingle();
    if (again) return { id: again.id, created: false, error: null };
    return { id: null, created: false, error: error?.message ?? "insert failed" };
  }
  return { id: data.id, created: true, error: null };
}

// ── recurring services ──────────────────────────────────────────────────────
export async function upsertRecurringService(input: RecurringServiceInput): Promise<UpsertResult> {
  const sb = createServiceClient();

  const { data: existing } = await sb
    .from("recurring_services")
    .select("id")
    .eq("contact_id", input.contact_id)
    .eq("service_type", input.service_type)
    .maybeSingle();

  if (existing) {
    const patch: Record<string, unknown> = {};
    if (input.amount !== undefined) patch.amount = input.amount;
    if (input.currency !== undefined) patch.currency = input.currency;
    if (input.billing_period !== undefined) patch.billing_period = input.billing_period;
    if (input.billing_day !== undefined) patch.billing_day = input.billing_day;
    if (input.active !== undefined) patch.active = input.active;
    if (input.excluded_from_auto_send !== undefined) patch.excluded_from_auto_send = input.excluded_from_auto_send;
    if (input.excluded_reason !== undefined) patch.excluded_reason = input.excluded_reason;
    if (input.started_at !== undefined) patch.started_at = input.started_at;
    if (input.ended_at !== undefined) patch.ended_at = input.ended_at;
    if (input.notes !== undefined) patch.notes = input.notes;
    if (Object.keys(patch).length > 0) {
      await sb.from("recurring_services").update(patch).eq("id", existing.id);
    }
    return { id: existing.id, created: false, error: null };
  }

  const { data, error } = await sb
    .from("recurring_services")
    .insert({
      contact_id: input.contact_id,
      service_type: input.service_type,
      amount: input.amount ?? null,
      currency: input.currency ?? "BGN",
      billing_period: input.billing_period ?? "monthly",
      billing_day: input.billing_day ?? null,
      active: input.active ?? true,
      excluded_from_auto_send: input.excluded_from_auto_send ?? false,
      excluded_reason: input.excluded_reason ?? null,
      started_at: input.started_at ?? null,
      ended_at: input.ended_at ?? null,
      notes: input.notes ?? null,
    })
    .select("id")
    .single();
  if (error || !data) return { id: null, created: false, error: error?.message ?? "insert failed" };
  return { id: data.id, created: true, error: null };
}

// ── match payment → invoice ─────────────────────────────────────────────────
export interface MatchPaymentResult {
  ok: boolean;
  decision: "auto_match" | "manual_review";
  confidence: MatchConfidence;
  signal_count: number;
  reasons: string[];
  blockers: string[];
  payment_id: string;
  invoice_id?: string;
  invoice_status?: "paid" | "partially_paid";
  manual_review_id?: string;
  error?: string;
}

export async function matchPayment(input: MatchPaymentInput): Promise<MatchPaymentResult> {
  const sb = createServiceClient();

  const { data: payment } = await sb.from("payments").select("*").eq("id", input.payment_id).maybeSingle();
  if (!payment) {
    return {
      ok: false,
      decision: "manual_review",
      confidence: "low",
      signal_count: 0,
      reasons: [],
      blockers: ["payment_not_found"],
      payment_id: input.payment_id,
      error: "payment not found",
    };
  }

  let invoice: Record<string, unknown> | null = null;
  if (input.invoice_id) {
    const { data } = await sb.from("invoices").select("*").eq("id", input.invoice_id).maybeSingle();
    invoice = data;
  }

  const candidateCount = input.candidate_invoice_count ?? (invoice ? 1 : undefined);
  const result = evaluatePaymentMatch(input.signals, { candidateInvoiceCount: candidateCount });

  // Auto-match: only when confident AND we have a concrete invoice to settle.
  if (result.decision === "auto_match" && invoice) {
    const invoiceId = invoice.id as string;
    const newStatus = invoiceStatusAfterPayment(payment.amount as number, invoice.amount_gross as number | null);
    await sb.from("invoices").update({ status: newStatus }).eq("id", invoiceId);

    const contactId = (payment.contact_id as string | null) ?? (invoice.contact_id as string | null) ?? null;
    await sb
      .from("payments")
      .update({
        match_status: "matched",
        match_confidence: result.confidence,
        invoice_id: invoiceId,
        contact_id: contactId,
      })
      .eq("id", payment.id);

    if (contactId) {
      await logActivity(sb, {
        contact_id: contactId,
        type: "payment_received",
        title: `Плащане засечено към фактура ${invoice.invoice_number ?? invoiceId}`,
        body: `${payment.amount} ${payment.currency} · увереност: ${result.confidence}`,
        metadata: {
          dedupe_key: `match:${payment.id}:${invoiceId}`,
          payment_id: payment.id,
          invoice_id: invoiceId,
          confidence: result.confidence,
        },
      }).catch(() => {});
    }

    return {
      ok: true,
      decision: "auto_match",
      confidence: result.confidence,
      signal_count: result.signalCount,
      reasons: result.reasons,
      blockers: [],
      payment_id: payment.id as string,
      invoice_id: invoiceId,
      invoice_status: newStatus,
    };
  }

  // Manual review path — invoice status is NEVER changed here.
  const blockers =
    result.decision === "auto_match" && !invoice ? [...result.blockers, "no_invoice_provided"] : result.blockers;
  const contactId = (payment.contact_id as string | null) ?? (invoice?.contact_id as string | null) ?? null;
  const ambiguous = candidateCount !== undefined && candidateCount > 1;

  const mr = await createManualReviewItem({
    type: ambiguous ? "ambiguous_pdf" : "payment_match",
    title: `Плащане за ръчна проверка: ${payment.amount} ${payment.currency}${payment.counterparty_name ? " · " + payment.counterparty_name : ""}`,
    description: `Сигнали: ${result.reasons.join(", ") || "няма"}. Причина за ръчна проверка: ${blockers.join(", ") || "—"}.`,
    related_payment_id: payment.id as string,
    related_invoice_id: (invoice?.id as string | undefined) ?? undefined,
    related_contact_id: contactId ?? undefined,
    severity: result.confidence === "medium" ? "medium" : "low",
  });

  if (ambiguous) {
    await sb.from("payments").update({ match_status: "ambiguous" }).eq("id", payment.id);
  }

  return {
    ok: true,
    decision: "manual_review",
    confidence: result.confidence,
    signal_count: result.signalCount,
    reasons: result.reasons,
    blockers,
    payment_id: payment.id as string,
    invoice_id: invoice?.id as string | undefined,
    manual_review_id: mr.id ?? undefined,
  };
}
