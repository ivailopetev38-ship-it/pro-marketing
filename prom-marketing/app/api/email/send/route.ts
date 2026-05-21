import { NextResponse } from "next/server";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const bodySchema = z.object({
  to: z.union([z.email(), z.array(z.email()).min(1).max(20)]),
  subject: z.string().min(1).max(200),
  html: z.string().min(1).max(60_000).optional(),
  text: z.string().min(1).max(60_000).optional(),
  replyTo: z.email().optional(),
  from: z.email().optional(),
});

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

function checkBearer(request: Request): { email: string } | null {
  const expected = process.env.INTERNAL_SEND_TOKEN;
  if (!expected) return null;
  const header = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return null;
  const provided = header.slice(prefix.length);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  const adminEmail = (process.env.ALLOWED_ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)[0];
  return { email: adminEmail || "ivailopetev38@gmail.com" };
}

export async function POST(request: Request) {
  const bearer = checkBearer(request);
  const user = bearer ?? (await requireAdmin());
  if (!user || !user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.message },
      { status: 400 }
    );
  }
  if (!parsed.data.html && !parsed.data.text) {
    return NextResponse.json(
      { error: "Either html or text body required" },
      { status: 400 }
    );
  }

  // Default reply-to is the admin who's sending — so replies land in their inbox
  // even when the From address is the branded promarketing.pw email.
  const replyTo = parsed.data.replyTo ?? user.email;

  const result = await sendEmail({
    to: parsed.data.to,
    subject: parsed.data.subject,
    html: parsed.data.html ?? "",
    text: parsed.data.text,
    replyTo,
  });

  return NextResponse.json({
    ok: !result.error,
    id: result.id,
    error: result.error,
    sentFrom: process.env.EMAIL_FROM ?? "unset",
    replyTo,
  });
}
