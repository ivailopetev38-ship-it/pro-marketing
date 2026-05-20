import "server-only";
import { createHash } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { fetchSheetCsv, parseCsv, type CsvRow } from "./google-sheets";

export interface LeadSource {
  id: string;
  label: string;
  csv_url: string;
  form_id: string | null;
}

export interface NormalizedLead {
  meta_lead_id: string;
  form_id: string;
  form_name: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  ad_id: string | null;
  ad_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  field_data: Record<string, string>;
  source: string;
  created_time: string | null;
}

// Column names appear in two flavours:
//  - Meta "Send to Google Sheets" sync → snake_case: id, created_time, full_name, email, phone_number, form_id, form_name, ad_name, campaign_name
//  - Meta Leads Centre CSV export → Title Case BG/EN: Created, Name, Email address, Phone, Source, Form, Channel
function lower(row: CsvRow): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k.toLowerCase().trim()] = (v ?? "").trim();
  }
  return out;
}

function pick(r: Record<string, string>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = r[k.toLowerCase()];
    if (v && v.trim().length > 0) return v.trim();
  }
  return null;
}

/** Parse "05/20/2026 1:59am" / ISO / unix-like strings into ISO 8601. */
function parseFlexibleDate(raw: string | null): string | null {
  if (!raw) return null;
  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) return direct.toISOString();
  // Meta Lead Center "05/20/2026 1:59am" format
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (m) {
    let hour = parseInt(m[4], 10);
    const ampm = m[6]?.toLowerCase();
    if (ampm === "pm" && hour < 12) hour += 12;
    if (ampm === "am" && hour === 12) hour = 0;
    const d = new Date(
      Date.UTC(parseInt(m[3], 10), parseInt(m[1], 10) - 1, parseInt(m[2], 10), hour, parseInt(m[5], 10))
    );
    return d.toISOString();
  }
  return null;
}

function synthesizeId(...parts: Array<string | null | undefined>): string {
  const joined = parts.filter(Boolean).join("|");
  return "syn_" + createHash("sha256").update(joined).digest("hex").slice(0, 24);
}

export function normalizeLeadRow(row: CsvRow, sourceLabel: string): NormalizedLead | null {
  const r = lower(row);

  const name = pick(r, "full_name", "full name", "name", "име");
  const email = pick(r, "email", "email_address", "email address", "имейл");
  const phone = pick(r, "phone_number", "phone number", "phone", "телефон");
  const createdRaw = pick(r, "created_time", "creation_time", "submit_time", "submitted_at", "created", "date added");
  const created = parseFlexibleDate(createdRaw);

  if (!name && !email && !phone) return null;

  const realId = pick(r, "id", "lead_id");
  const formName = pick(r, "form_name", "form name", "form");
  const formId = pick(r, "form_id", "form id");

  // Without a real lead id (Leads Center CSV doesn't include one), synthesise
  // a deterministic key so re-uploading the same CSV doesn't duplicate rows.
  const meta_lead_id = realId ?? synthesizeId(email, phone, createdRaw, formName);

  return {
    meta_lead_id,
    form_id: formId ?? formName ?? sourceLabel,
    form_name: formName,
    campaign_id: pick(r, "campaign_id", "campaign id"),
    campaign_name: pick(r, "campaign_name", "campaign name", "source"),
    ad_id: pick(r, "ad_id", "ad id"),
    ad_name: pick(r, "ad_name", "ad name"),
    full_name: name,
    email,
    phone,
    field_data: row,
    source: sourceLabel,
    created_time: created,
  };
}

async function upsertLeads(
  leads: NormalizedLead[]
): Promise<{ inserted: number; error: string | null }> {
  if (leads.length === 0) return { inserted: 0, error: null };

  const supabase = createServiceClient();
  const ids = leads.map((l) => l.meta_lead_id);
  const { data: existing } = await supabase
    .from("meta_leads")
    .select("meta_lead_id")
    .in("meta_lead_id", ids);

  const seen = new Set((existing ?? []).map((r) => r.meta_lead_id));
  const fresh = leads.filter((l) => !seen.has(l.meta_lead_id));
  if (fresh.length === 0) return { inserted: 0, error: null };

  const rows = fresh.map((l) => ({
    meta_lead_id: l.meta_lead_id,
    form_id: l.form_id,
    form_name: l.form_name,
    campaign_id: l.campaign_id,
    campaign_name: l.campaign_name,
    ad_id: l.ad_id,
    ad_name: l.ad_name,
    full_name: l.full_name,
    email: l.email,
    phone: l.phone,
    field_data: l.field_data,
    source: l.source,
    raw_payload: l.field_data,
    created_time: l.created_time,
  }));

  const { error } = await supabase
    .from("meta_leads")
    .upsert(rows, { onConflict: "meta_lead_id" });

  if (error) return { inserted: 0, error: error.message.slice(0, 240) };
  return { inserted: fresh.length, error: null };
}

export async function importCsvBuffer(
  csvText: string,
  sourceLabel: string
): Promise<{ fetched: number; inserted: number; error: string | null; leads: NormalizedLead[] }> {
  try {
    const rows = parseCsv(csvText);
    const leads = rows
      .map((r) => normalizeLeadRow(r, sourceLabel))
      .filter((l): l is NormalizedLead => l !== null);
    const { inserted, error } = await upsertLeads(leads);
    return { fetched: leads.length, inserted, error, leads };
  } catch (e) {
    return {
      fetched: 0,
      inserted: 0,
      error: e instanceof Error ? e.message.slice(0, 240) : String(e),
      leads: [],
    };
  }
}

export interface SyncResult {
  source_id: string;
  label: string;
  fetched: number;
  inserted: number;
  error: string | null;
}

export async function syncAllSources(): Promise<{
  results: SyncResult[];
  totalNewLeads: number;
  newLeads: NormalizedLead[];
}> {
  const supabase = createServiceClient();
  const { data: sources } = await supabase
    .from("meta_lead_sources")
    .select("id, label, csv_url, form_id")
    .eq("enabled", true);

  const results: SyncResult[] = [];
  const newLeads: NormalizedLead[] = [];

  for (const source of (sources ?? []) as LeadSource[]) {
    const result: SyncResult = {
      source_id: source.id,
      label: source.label,
      fetched: 0,
      inserted: 0,
      error: null,
    };
    try {
      const csv = await fetchSheetCsv(source.csv_url);
      const parsed = await importCsvBuffer(csv, `google_sheets:${source.label}`);
      result.fetched = parsed.fetched;
      result.inserted = parsed.inserted;
      result.error = parsed.error;
      newLeads.push(...parsed.leads.slice(0, parsed.inserted));
    } catch (e) {
      result.error = e instanceof Error ? e.message.slice(0, 240) : String(e);
    }

    await supabase
      .from("meta_lead_sources")
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_count: result.inserted,
        last_sync_error: result.error,
      })
      .eq("id", source.id);

    results.push(result);
  }

  return {
    results,
    totalNewLeads: results.reduce((s, r) => s + r.inserted, 0),
    newLeads,
  };
}
