// Shared placeholder shell for modules that exist as schema + UI scaffold but
// don't yet have a live integration. Lists the planned features, the connected
// API surface, and a clear "next step" button.

import Link from "next/link";

export interface PlaceholderFeature {
  title: string;
  description: string;
  icon?: string;
  ready?: boolean;
}

export interface PlaceholderProps {
  icon: string;
  title: string;
  description: string;
  status: { label: string; tone: "ready" | "pending" | "wip" };
  features: PlaceholderFeature[];
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  /** Optional live count widgets — render whatever — shown as a stat strip. */
  stats?: Array<{ label: string; value: string | number; color?: string; hint?: string }>;
  children?: React.ReactNode;
}

export function ModulePlaceholder({
  icon,
  title,
  description,
  status,
  features,
  primaryAction,
  secondaryAction,
  stats,
  children,
}: PlaceholderProps) {
  const toneClass =
    status.tone === "ready"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : status.tone === "wip"
        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
        : "bg-slate-500/15 text-slate-300 border-slate-500/30";

  return (
    <div className="space-y-6 p-6 md:p-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${toneClass}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status.label}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold">
            <span className="mr-2">{icon}</span>
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-secondary)]">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {primaryAction && (
            <Link
              href={primaryAction.href}
              className="rounded-lg border border-[var(--color-accent-cyan)]/40 bg-[var(--color-accent-cyan)]/10 px-4 py-2 text-sm font-medium text-[var(--color-accent-cyan)] transition hover:bg-[var(--color-accent-cyan)]/20"
            >
              {primaryAction.label}
            </Link>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/40 px-4 py-2 text-sm text-[var(--color-text-secondary)] transition hover:border-[var(--color-accent-cyan)]/60 hover:text-[var(--color-text-primary)]"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      </header>

      {stats && stats.length > 0 && (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/40 p-4"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-bold" style={{ color: s.color ?? "var(--color-text-primary)" }}>
                {s.value}
              </p>
              {s.hint && <p className="text-[11px] text-[var(--color-text-tertiary)]">{s.hint}</p>}
            </div>
          ))}
        </section>
      )}

      <section className="grid gap-3 md:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.title}
            className="flex gap-3 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/40 p-4 transition-colors hover:border-[var(--color-accent-cyan)]/40"
          >
            <span className="text-2xl">{f.icon ?? "•"}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{f.title}</h3>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider ${
                    f.ready
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                  }`}
                >
                  {f.ready ? "готово" : "очаква"}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">{f.description}</p>
            </div>
          </div>
        ))}
      </section>

      {children}
    </div>
  );
}
