"use client";
import { useMemo, useState } from "react";
import type { InsightRow } from "@/lib/crm/types";
import {
  INSIGHT_CATEGORY_LABEL,
  INSIGHT_STATUS_LABEL,
  INSIGHT_STATUS_COLOR,
  INSIGHT_SOURCE_LABEL,
  SEVERITY_LABEL,
  SEVERITY_COLOR,
  formatDate,
} from "@/lib/crm/labels";
import { createInsightAction, setInsightStatusAction } from "@/app/admin/(protected)/insights/actions";

const STATUS_OPTIONS = Object.keys(INSIGHT_STATUS_LABEL);
const CATEGORY_OPTIONS = Object.keys(INSIGHT_CATEGORY_LABEL);
const SEVERITY_OPTIONS = ["high", "medium", "low"];
const SEVERITY_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };
const inputCls =
  "w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-cyan)]/60";

type View = "open" | "all" | "done";

export function InsightsBoard({ rows }: { rows: InsightRow[] }) {
  const [view, setView] = useState<View>("open");
  const [showCreate, setShowCreate] = useState(false);

  const visible = useMemo(() => {
    const filtered = rows.filter((r) =>
      view === "open"
        ? r.status === "new" || r.status === "in_progress"
        : view === "done"
          ? r.status === "done" || r.status === "dismissed"
          : true
    );
    return filtered.sort((a, b) => {
      const sev = (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0);
      if (sev !== 0) return sev;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [rows, view]);

  const views: Array<{ key: View; label: string; count: number }> = [
    { key: "open", label: "Отворени", count: rows.filter((r) => r.status === "new" || r.status === "in_progress").length },
    { key: "done", label: "Приключени", count: rows.filter((r) => r.status === "done" || r.status === "dismissed").length },
    { key: "all", label: "Всички", count: rows.length },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {views.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              className={
                view === v.key
                  ? "rounded-lg border border-[var(--color-accent-cyan)]/60 bg-[var(--color-accent-cyan)]/15 px-3 py-1.5 text-xs font-semibold text-[var(--color-accent-cyan)]"
                  : "rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]"
              }
            >
              {v.label} <span className="font-mono opacity-70">{v.count}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((s) => !s)}
          className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
        >
          {showCreate ? "✕ Затвори" : "+ Нова препоръка"}
        </button>
      </div>

      {showCreate && (
        <form action={createInsightAction} className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4">
          <h3 className="mb-3 font-display text-base font-semibold">Нова препоръка</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block sm:col-span-2 lg:col-span-3">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Заглавие *</span>
              <input name="title" required className={inputCls} placeholder="Какво да се подобри" />
            </label>
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Категория</span>
              <select name="category" defaultValue="other" className={inputCls}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{INSIGHT_CATEGORY_LABEL[c]}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Приоритет</span>
              <select name="severity" defaultValue="medium" className={inputCls}>
                {SEVERITY_OPTIONS.map((s) => (
                  <option key={s} value={s}>{SEVERITY_LABEL[s]}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Очакван ефект</span>
              <input name="impact" className={inputCls} placeholder="напр. +10% конверсия" />
            </label>
            <label className="block sm:col-span-2 lg:col-span-3">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Детайли</span>
              <textarea name="detail" rows={3} className={inputCls} placeholder="Какво, защо и как." />
            </label>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button type="submit" className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400">
              Запази
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-md border border-white/10 px-4 py-2 text-sm text-[var(--color-text-tertiary)] transition hover:text-[var(--color-text-primary)]">
              Отказ
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2.5">
        {visible.map((r) => {
          const closed = r.status === "done" || r.status === "dismissed";
          return (
            <article
              key={r.id}
              className="cc-panel p-4"
              style={{ ["--cc" as string]: SEVERITY_COLOR[r.severity], opacity: closed ? 0.6 : 1 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: `${SEVERITY_COLOR[r.severity]}22`, color: SEVERITY_COLOR[r.severity] }}
                    >
                      {SEVERITY_LABEL[r.severity]}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-[var(--color-text-secondary)]">
                      {INSIGHT_CATEGORY_LABEL[r.category] ?? r.category}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">
                      {INSIGHT_SOURCE_LABEL[r.source] ?? r.source} · {formatDate(r.created_at)}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-[15px] font-semibold text-[var(--color-text-primary)]">{r.title}</h3>
                  {r.detail && <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{r.detail}</p>}
                  {r.impact && (
                    <p className="mt-2 inline-block rounded-md border border-[var(--color-accent-cyan)]/25 bg-[var(--color-accent-cyan)]/[0.06] px-2.5 py-1 text-[11px] text-[var(--color-accent-cyan)]">
                      Ефект: {r.impact}
                    </p>
                  )}
                </div>
                <form action={setInsightStatusAction} className="shrink-0">
                  <input type="hidden" name="insight_id" value={r.id} />
                  <select
                    name="status"
                    defaultValue={r.status}
                    onChange={(e) => e.currentTarget.form?.requestSubmit()}
                    className="rounded-md border px-2 py-1 text-[11px] outline-none"
                    style={{
                      background: `${INSIGHT_STATUS_COLOR[r.status]}1a`,
                      color: INSIGHT_STATUS_COLOR[r.status],
                      borderColor: `${INSIGHT_STATUS_COLOR[r.status]}55`,
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{INSIGHT_STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </form>
              </div>
            </article>
          );
        })}
        {visible.length === 0 && (
          <div className="cc-panel px-4 py-12 text-center text-sm text-[var(--color-text-tertiary)]">
            {view === "open"
              ? "Няма отворени препоръки. 🎉 Хермес ще добавя свежи всяка нощ."
              : "Няма записи в този изглед."}
          </div>
        )}
      </div>
    </div>
  );
}
