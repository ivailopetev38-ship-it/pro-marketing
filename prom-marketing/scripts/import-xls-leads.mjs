#!/usr/bin/env node
// Парс на SpreadsheetML XML файлове от Meta Ads Manager и
// импорт в CRM-а с дата на въвеждане днес.

import fs from "node:fs";
import path from "node:path";

const TOKEN = "d57f2e068ec50e6ebccc5e98dbf9a9189a2fbaa238b22354036250334a57872e";
const HOST = "https://promarketing.pw";

const FILES = [
  "C:/Users/User/Downloads/Multi_ad_objects_leads_Leads_2026-05-21_2026-05-24/АЙ банери Автоматизации на биснеси и маркетинг общ/АЙ банери Автоматизации на биснеси и маркетинг общ_Leads_2026-05-24_2026-05-24.xls",
  "C:/Users/User/Downloads/Multi_ad_objects_leads_Leads_2026-05-21_2026-05-24/АЙ банери Автоматизации на биснеси и маркетинг – само …/АЙ банери Автоматизации на биснеси и маркетинг – само СРМ_Leads_2026-05-24_2026-05-24.xls",
];

function parseSpreadsheetML(xml) {
  // Find <Row>...</Row> blocks inside <Table>
  const rows = [];
  const rowRe = /<Row[^>]*>([\s\S]*?)<\/Row>/g;
  const cellRe = /<Cell[^>]*>\s*<Data[^>]*>([\s\S]*?)<\/Data>\s*<\/Cell>/g;
  let m;
  while ((m = rowRe.exec(xml))) {
    const row = [];
    const inner = m[1];
    let c;
    while ((c = cellRe.exec(inner))) {
      row.push(c[1].trim());
    }
    rows.push(row);
  }
  return rows;
}

const allLeads = [];
for (const file of FILES) {
  const xml = fs.readFileSync(file, "utf8");
  const rows = parseSpreadsheetML(xml);
  if (rows.length < 2) continue;
  const header = rows[0];
  const idx = {
    id: header.indexOf("id"),
    created_time: header.indexOf("created_time"),
    ad_name: header.indexOf("ad_name"),
    campaign_name: header.indexOf("campaign_name"),
    form_name: header.indexOf("form_name"),
    email: header.indexOf("email"),
    full_name: header.indexOf("full_name"),
    phone_number: header.indexOf("phone_number"),
  };
  const folderName = path.basename(path.dirname(file));
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length === 0) continue;
    allLeads.push({
      meta_lead_id: r[idx.id],
      created_time: r[idx.created_time],
      ad_name: r[idx.ad_name],
      campaign_name: r[idx.campaign_name],
      form_name: r[idx.form_name],
      email: r[idx.email] || "",
      full_name: r[idx.full_name] || "",
      phone: r[idx.phone_number] || "",
      source_file: folderName,
    });
  }
}

console.log(`Прочетени ${allLeads.length} лида от ${FILES.length} файла:\n`);
for (const l of allLeads) {
  console.log(` · ${l.full_name.padEnd(28)} ${l.email.padEnd(35)} ${l.phone}  [${l.form_name}]`);
}

// Post to CRM
console.log("\nИмпортирам в CRM-а...");
const r = await fetch(`${HOST}/api/admin/contacts`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ leads: allLeads }),
});
const out = await r.json();
console.log(JSON.stringify(out, null, 2));
