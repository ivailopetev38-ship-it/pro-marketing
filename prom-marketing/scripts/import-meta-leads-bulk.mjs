#!/usr/bin/env node
// Parse all Meta leads XLS (XML SpreadsheetML) files from /tmp/leads-import,
// deduplicate, check against CRM, insert only new ones.

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const ROOT = "/tmp/leads-import";

// --- Parse one XLS-XML file ---
function parseXls(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  // Extract all <Row>...</Row> blocks, then <Data ...>VALUE</Data> inside
  const rowRegex = /<Row[^>]*>([\s\S]*?)<\/Row>/g;
  const dataRegex = /<Data\s+ss:Type="[^"]+"[^>]*>([\s\S]*?)<\/Data>/g;
  const rows = [];
  let rowMatch;
  while ((rowMatch = rowRegex.exec(content)) !== null) {
    const cells = [];
    let dataMatch;
    const inner = rowMatch[1];
    while ((dataMatch = dataRegex.exec(inner)) !== null) {
      cells.push(decode(dataMatch[1]));
    }
    if (cells.length > 0) rows.push(cells);
  }
  return rows;
}

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function normalizePhone(p) {
  if (!p) return null;
  const clean = p.replace(/[\s\-()]/g, "");
  // Keep digits and leading +
  if (clean.startsWith("+")) return clean;
  if (clean.startsWith("0") && clean.length >= 10) return "+359" + clean.slice(1);
  if (clean.startsWith("359") && clean.length >= 12) return "+" + clean;
  return clean.startsWith("+") ? clean : "+" + clean;
}

function normalizeEmail(e) {
  if (!e) return null;
  return e.toLowerCase().trim();
}

// --- Find all .xls files recursively ---
function findXlsFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findXlsFiles(full, out);
    else if (entry.name.endsWith(".xls")) out.push(full);
  }
  return out;
}

// --- Main ---
const files = findXlsFiles(ROOT);
console.log(`Found ${files.length} XLS files\n`);

const HEADER_KEYS = [
  "id", "created_time", "ad_id", "ad_name", "adset_id", "adset_name",
  "campaign_id", "campaign_name", "form_id", "form_name",
  "is_organic", "platform", "email", "full_name", "phone_number",
];

let allLeads = [];
for (const f of files) {
  const rows = parseXls(f);
  if (rows.length < 2) continue;
  // First row should be header; check if it matches
  const header = rows[0].map((h) => h.toLowerCase());
  const idxOf = (key) => header.indexOf(key);
  const dataRows = rows.slice(1);
  console.log(`  ${path.basename(f)} — ${dataRows.length} rows`);
  for (const row of dataRows) {
    if (row.length < HEADER_KEYS.length) continue;
    const lead = {
      id: row[idxOf("id")] || null,
      created_time: row[idxOf("created_time")] || null,
      ad_name: row[idxOf("ad_name")] || null,
      adset_name: row[idxOf("adset_name")] || null,
      campaign_name: row[idxOf("campaign_name")] || null,
      form_name: row[idxOf("form_name")] || null,
      platform: row[idxOf("platform")] || null,
      email: normalizeEmail(row[idxOf("email")]),
      full_name: row[idxOf("full_name")] || null,
      phone_number: normalizePhone(row[idxOf("phone_number")]),
    };
    if (lead.email || lead.phone_number || lead.full_name) allLeads.push(lead);
  }
}

console.log(`\nTotal rows parsed: ${allLeads.length}`);

// --- Deduplicate by Meta lead id (first) then by email/phone ---
const seenIds = new Set();
const dedupById = [];
for (const l of allLeads) {
  if (l.id && seenIds.has(l.id)) continue;
  if (l.id) seenIds.add(l.id);
  dedupById.push(l);
}
console.log(`After dedup by Meta lead id: ${dedupById.length}`);

const seenKeys = new Set();
const unique = [];
for (const l of dedupById) {
  const key = (l.email || "") + "|" + (l.phone_number || "");
  if (key === "|") continue;
  if (seenKeys.has(key)) continue;
  seenKeys.add(key);
  unique.push(l);
}
console.log(`After dedup by email+phone: ${unique.length}\n`);

// --- Fetch existing contacts ---
const { data: existing, error: exErr } = await sb
  .from("contacts")
  .select("id, email, phone");
if (exErr) {
  console.error("Failed to fetch existing contacts:", exErr.message);
  process.exit(1);
}
const existingEmails = new Set(existing.map((c) => (c.email || "").toLowerCase()).filter(Boolean));
const existingPhones = new Set(existing.map((c) => c.phone).filter(Boolean));
console.log(`Existing CRM: ${existing.length} contacts (${existingEmails.size} unique emails, ${existingPhones.size} unique phones)\n`);

// --- Filter NEW only ---
const newOnly = unique.filter((l) => {
  if (l.email && existingEmails.has(l.email)) return false;
  if (l.phone_number && existingPhones.has(l.phone_number)) return false;
  return true;
});
console.log(`NEW leads to insert: ${newOnly.length}\n`);

if (newOnly.length === 0) {
  console.log("Nothing to insert — all leads already in CRM.");
  process.exit(0);
}

// --- Insert ---
const records = newOnly.map((l) => ({
  full_name: l.full_name || l.email || "Lead",
  email: l.email,
  phone: l.phone_number,
  stage: "lead",
  source: "meta_lead",
  notes: `[Bulk import 28.05.2026] Campaign: ${l.campaign_name || "n/a"} | Ad: ${l.ad_name || "n/a"} | Form: ${l.form_name || "n/a"} | Platform: ${l.platform || "n/a"} | Meta lead ID: ${l.id || "n/a"} | Created: ${l.created_time || "n/a"}`,
  created_at: l.created_time ? new Date(l.created_time).toISOString() : new Date().toISOString(),
}));

// Insert in batches of 50
const BATCH = 50;
let inserted = 0;
for (let i = 0; i < records.length; i += BATCH) {
  const batch = records.slice(i, i + BATCH);
  const { error } = await sb.from("contacts").insert(batch);
  if (error) {
    console.error(`Batch ${i / BATCH + 1} failed:`, error.message);
    // Try insert one by one to skip conflicts
    for (const r of batch) {
      const { error: e } = await sb.from("contacts").insert([r]);
      if (!e) inserted++;
      else console.log(`  Skipped ${r.email || r.phone}: ${e.message.slice(0, 80)}`);
    }
  } else {
    inserted += batch.length;
    console.log(`  Batch ${i / BATCH + 1}: ${batch.length} inserted (running total: ${inserted})`);
  }
}

console.log(`\n✅ DONE: ${inserted} new leads imported into CRM`);
console.log(`   (${unique.length - newOnly.length} were already in CRM)`);
