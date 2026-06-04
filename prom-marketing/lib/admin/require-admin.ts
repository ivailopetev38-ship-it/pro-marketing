import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin/session";

/**
 * Verify the admin is logged in for a Server Action / server context.
 *
 * The admin auth model is the signed HMAC `pm_admin` cookie (password login →
 * issueSession), enforced by proxy.ts + the protected layout. There is NO
 * Supabase auth session, so Server Actions must check THIS cookie — not
 * `supabase.auth.getUser()`, which is always null here.
 *
 * Throws "Unauthorized" if the session cookie is missing/invalid.
 * Returns the actor label used for `created_by` on logged activities.
 */
export async function requireAdmin(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value ?? null;
  if (!verifySession(token)) {
    throw new Error("Unauthorized");
  }
  return process.env.ADMIN_ACTOR || "Ивайло";
}
