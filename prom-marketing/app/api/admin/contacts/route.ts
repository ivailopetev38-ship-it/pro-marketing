import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { timingSafeEqual } from "node:crypto";

export const dynamic = "force-dynamic";

interface IncomingLead {
  full_name?: string;
  email?: string;
  phone?: string;
  created_time?: string;
  form_name?: string;
  campaign_name?: string;
  meta_lead_id?: string;
  source_file?: string;
}

function checkBearer(request: Request): boolean {
  const expected = process.env.INTERNAL_SEND_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return false;
  const provided = header.slice(7);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!checkBearer(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let body: { leads?: IncomingLead[] };
  try {
    body = (await request.json()) as { leads?: IncomingLead[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const leads = body.leads ?? [];
  if (!Array.isArray(leads) || leads.length === 0) {
    return NextResponse.json({ error: "leads array required" }, { status: 400 });
  }

  const sb = createServiceClient();
  const inserted: string[] = [];
  const updated: string[] = [];
  const skipped: string[] = [];

  for (const l of leads) {
    const email = (l.email ?? "").trim().toLowerCase();
    const phone = (l.phone ?? "").trim();
    const name = (l.full_name ?? "").trim() || null;
    if (!email && !phone) {
      skipped.push("(no email/phone)");
      continue;
    }

    // Dedup: email first, then phone
    let existing = null;
    if (email) {
      const { data } = await sb.from("contacts").select("id, full_name").eq("email", email).maybeSingle();
      existing = data;
    }
    if (!existing && phone) {
      const { data } = await sb.from("contacts").select("id, full_name").eq("phone", phone).maybeSingle();
      existing = data;
    }

    if (existing) {
      // Maybe upgrade name if missing
      if (!existing.full_name && name) {
        await sb.from("contacts").update({ full_name: name }).eq("id", existing.id);
        updated.push(email || phone);
      } else {
        skipped.push(email || phone);
      }
      continue;
    }

    const { data: created, error } = await sb
      .from("contacts")
      .insert({
        full_name: name,
        email: email || null,
        phone: phone || null,
        stage: "lead",
        source: "meta_lead",
        source_ref: l.meta_lead_id || null,
        created_at: l.created_time ? new Date(l.created_time).toISOString() : new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !created) {
      skipped.push(`${email || phone} (error: ${error?.message ?? "unknown"})`);
      continue;
    }

    inserted.push(email || phone);

    // Log a 'meta_lead' activity for the new contact
    await sb.from("contact_activities").insert({
      contact_id: created.id,
      activity_type: "meta_lead",
      title: l.form_name ? `Meta lead · ${l.form_name}` : "Meta lead (импортиран)",
      body: l.campaign_name ? `Кампания: ${l.campaign_name}` : null,
      occurred_at: l.created_time ? new Date(l.created_time).toISOString() : new Date().toISOString(),
      metadata: {
        meta_lead_id: l.meta_lead_id,
        source_file: l.source_file,
        backfilled: true,
      },
    });
  }

  return NextResponse.json({
    summary: {
      total: leads.length,
      inserted: inserted.length,
      updated: updated.length,
      skipped: skipped.length,
    },
    inserted,
    updated,
    skipped,
  });
}

/**
 * Admin read endpoint for the contacts dashboard.
 * Currently open during preview mode — re-add Bearer/INTERNAL_SEND_TOKEN
 * guard before going public.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") ?? "not_emailed";

  const supabase = createServiceClient();

  if (filter === "not_emailed") {
    // Find ids that DO have email_sent
    const { data: emailed } = await supabase
      .from("contact_activities")
      .select("contact_id")
      .eq("activity_type", "email_sent");
    const emailedIds = Array.from(new Set((emailed ?? []).map((r) => r.contact_id)));

    // Fetch all then filter in JS — keeps the type-level depth manageable
    // for the supabase-js builder when emailedIds is large.
    const { data: all, error } = await supabase
      .from("contacts")
      .select("id, full_name, email, phone, stage, source, source_ref, created_at")
      .not("email", "is", null)
      .neq("email", "")
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const set = new Set(emailedIds);
    const filtered = (all ?? []).filter((c) => !set.has(c.id));
    return NextResponse.json({ filter, count: filtered.length, contacts: filtered });
  }

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ filter, count: data?.length ?? 0, contacts: data ?? [] });
}
