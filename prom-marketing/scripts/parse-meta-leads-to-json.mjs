#!/usr/bin/env node
// Parse all Meta leads XLS files and output unique leads to JSON.
import fs from "node:fs";
import path from "node:path";

const ROOT = "C:/Users/User/AppData/Local/Temp/leads-import";
const OUT = "C:/Users/User/AppData/Local/Temp/leads-import/parsed-leads.json";

function parseXls(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const rowRegex = /<Row[^>]*>([\s\S]*?)<\/Row>/g;
  const dataRegex = /<Data\s+ss:Type="[^"]+"[^>]*>([\s\S]*?)<\/Data>/g;
  const rows = [];
  let rowMatch;
  while ((rowMatch = rowRegex.exec(content)) !== null) {
    const cells = [];
    let dataMatch;
    while ((dataMatch = dataRegex.exec(rowMatch[1])) !== null) {
      cells.push(decode(dataMatch[1]));
    }
    if (cells.length > 0) rows.push(cells);
  }
  return rows;
}

function decode(s) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function normalizePhone(p) {
  if (!p) return null;
  const clean = p.replace(/[\s\-()]/g, "");
  if (clean.startsWith("+")) return clean;
  if (clean.startsWith("0") && clean.length >= 10) return "+359" + clean.slice(1);
  if (clean.startsWith("359") && clean.length >= 12) return "+" + clean;
  return clean.startsWith("+") ? clean : null;
}

function normalizeEmail(e) {
  if (!e) return null;
  return e.toLowerCase().trim();
}

function findXls(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findXls(full, out);
    else if (entry.name.endsWith(".xls")) out.push(full);
  }
  return out;
}

const files = findXls(ROOT);
const HEADER = ["id","created_time","ad_id","ad_name","adset_id","adset_name","campaign_id","campaign_name","form_id","form_name","is_organic","platform","email","full_name","phone_number"];

let all = [];
for (const f of files) {
  const rows = parseXls(f);
  if (rows.length < 2) continue;
  const header = rows[0].map((h) => h.toLowerCase());
  const idx = (k) => header.indexOf(k);
  for (const r of rows.slice(1)) {
    if (r.length < HEADER.length) continue;
    all.push({
      id: r[idx("id")] || null,
      created_time: r[idx("created_time")] || null,
      ad_name: r[idx("ad_name")] || null,
      campaign_name: r[idx("campaign_name")] || null,
      form_name: r[idx("form_name")] || null,
      platform: r[idx("platform")] || null,
      email: normalizeEmail(r[idx("email")]),
      full_name: r[idx("full_name")] || null,
      phone: normalizePhone(r[idx("phone_number")]),
    });
  }
}

const byId = new Map();
for (const l of all) {
  if (l.id) byId.set(l.id, l);
  else byId.set(`__no_id_${all.indexOf(l)}__`, l);
}
const dedupId = Array.from(byId.values());

const seenKey = new Set();
const unique = [];
for (const l of dedupId) {
  const key = (l.email || "") + "|" + (l.phone || "");
  if (key === "|") continue;
  if (seenKey.has(key)) continue;
  seenKey.add(key);
  unique.push(l);
}

fs.writeFileSync(OUT, JSON.stringify(unique, null, 2));
console.log(`Parsed ${files.length} files, ${all.length} rows`);
console.log(`After Meta id dedup: ${dedupId.length}`);
console.log(`Final unique (email+phone): ${unique.length}`);
console.log(`Output: ${OUT}`);
