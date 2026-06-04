import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin/session";
import { upsertContactAndLog } from "@/lib/contacts/repository";
import { CONTACT_STAGES } from "@/lib/contacts/types";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  // Free-form pasted text. The /parse endpoint converts blobs like "Иван
  // Иванов · ivan@gmail.com · +359888..." into structured fields. Here we
  // accept already-parsed fields.
  full_name: z.string().max(120).optional(),
  email: z.union([z.email(), z.literal("")]).optional(),
  phone: z.string().max(40).optional(),
  company: z.string().max(120).optional(),
  notes: z.string().max(4000).optional(),
  stage: z.enum(CONTACT_STAGES).optional(),
  source: z.string().max(40).default("manual"),
  /** What the visitor said — gets prepended to notes if provided. */
  inquiry: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value ?? null;
  if (!verifySession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const { full_name, email, phone, company, notes, stage, source, inquiry } = parsed.data;

  if (!email && !phone && !full_name) {
    return NextResponse.json(
      { error: "Поне едно от полетата (име/имейл/телефон) е задължително." },
      { status: 400 }
    );
  }

  const combinedNotes = [inquiry && `Запитване: „${inquiry}"`, notes].filter(Boolean).join("\n\n") || null;

  // For phone-only contacts we synthesize an empty email so upsert works —
  // repository requires at least email or phone. We pass null and the function
  // already handles phone-only lookup.
  const res = await upsertContactAndLog({
    full_name: full_name || null,
    email: email && email.length > 0 ? email.toLowerCase().trim() : null,
    phone: phone || null,
    company: company || null,
    source,
    initial_stage: stage ?? "lead",
    activity: combinedNotes
      ? {
          type: "note",
          title: "Quick-add бележка",
          body: combinedNotes,
          metadata: { inquiry: inquiry ?? null, via: "quick_add" },
        }
      : undefined,
  });

  if (res.error || !res.contact_id) {
    return NextResponse.json({ error: res.error ?? "Грешка при запис" }, { status: 500 });
  }

  return NextResponse.json({ id: res.contact_id });
}
