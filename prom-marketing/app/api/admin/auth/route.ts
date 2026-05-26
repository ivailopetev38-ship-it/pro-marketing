import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_MAX_AGE, issueSession } from "@/lib/admin/session";
import { timingSafeEqual } from "node:crypto";

export const dynamic = "force-dynamic";

// Login — POST { password }
export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "ADMIN_PASSWORD not configured" }, { status: 500 });
  }
  const provided = String(body?.password ?? "");
  // Constant-time compare to avoid timing leaks
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  const ok = a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
  if (!ok) {
    // Slight artificial delay to slow brute-force
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ error: "Грешна парола" }, { status: 401 });
  }

  const token = issueSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  });
  return res;
}

// Logout — DELETE
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
