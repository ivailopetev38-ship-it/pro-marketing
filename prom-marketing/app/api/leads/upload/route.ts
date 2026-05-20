import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { importCsvBuffer } from "@/lib/leads/import";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const allowed = (process.env.ALLOWED_ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!allowed.includes(user.email.toLowerCase())) return null;
  return user;
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  const label = (form.get("label") as string | null)?.trim() || "manual_upload";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (>10MB)" }, { status: 413 });
  }

  const text = await file.text();
  const result = await importCsvBuffer(text, `csv_upload:${label}`);

  return NextResponse.json({ ok: !result.error, ...result, leads: undefined, count: result.leads.length });
}
