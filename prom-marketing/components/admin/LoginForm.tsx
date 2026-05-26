"use client";
import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    initialError === "forbidden" ? "Нямате достъп до администрацията." : null
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(json?.error ?? "Грешна парола");
        setSubmitting(false);
      }
    } catch {
      setError("Грешка при свързване. Опитай отново.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm">
      <h1 className="font-display text-3xl font-bold">Вход</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">ProMarketing CRM</p>

      <div
        className="mt-8 flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors focus-within:border-[var(--color-accent-cyan)]"
        style={{
          borderColor: "var(--color-border-default)",
          background: "rgba(0,0,0,0.25)",
        }}
      >
        <Lock className="h-4 w-4 flex-shrink-0" style={{ color: "var(--color-accent-cyan)" }} />
        <input
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          placeholder="Парола"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent text-base text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]/60"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !password}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: "var(--color-accent-cyan)",
          color: "var(--color-bg-void)",
        }}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Влизам…
          </>
        ) : (
          "Влез"
        )}
      </button>

      <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
        ProMarketing LTD · защитен с парола
      </p>
    </form>
  );
}
