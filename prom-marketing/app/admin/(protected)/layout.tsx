import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin/session";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value ?? null;

  if (!verifySession(token)) {
    redirect("/admin/login");
  }

  return <AdminShell email="Ивайло">{children}</AdminShell>;
}
