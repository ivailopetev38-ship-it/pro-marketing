"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  STAGE_COLOR,
  STAGE_LABEL,
  FOLLOWUP_STATUS_COLOR,
  FOLLOWUP_STATUS_LABEL,
  ACTIVITY_LABEL,
  type ContactRow,
} from "@/lib/contacts/types";
import { followupQuickAction } from "@/app/admin/(protected)/follow-up/actions";

export interface FollowupRow extends ContactRow {
  last_sent_type: string | null;
  last_sent_at: string | null;
}

// Pipeline priority (requirement #2): negotiating → offer_sent →
// presentation_sent → contacted → rest.
const STAGE_PRIORITY: Record<string, number> = {
  negotiating: 0,
  offer_sent: 1,
  presentation_sent: 2,
  contacted: 3,
  discovery: 4,
  lead: 5,
  won: 6,
  lost: 7,
};

function isHeard(r: FollowupRow): boolean {
  if (!r.last_heard_from_at) return false;
  if (!r.next_followup_at) return true;
  return new Date(r.last_heard_from_at) >= new Date(r.next_followup_at);
}

function isOverdue(r: FollowupRow): boolean {
  if (!r.next_followup_at) return false;
  if (new Date(r.next_followup_at) >= new Date()) return false;
  return !isHeard(r); // requirement #7 — not overdue if already heard
}

function isSentNotHeard(r: FollowupRow): boolean {
  if (!r.last_sent_at) return false;
  if (!r.last_heard_from_at) return true;
  return new Date(r.last_heard_from_at) < new Date(r.last_sent_at);
}

function relative(iso: string): string {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 3600) return `преди ${Math.max(1, Math.round(diff / 60))} мин`;
  if (diff < 86400) return `преди ${Math.round(diff / 3600)} ч`;
  if (diff < 7 * 86400) return `преди ${Math.round(diff / 86400)} дни`;
  return new Date(iso).toLocaleDateString("bg-BG", { day: "2-digit", month: "short" });
}

function followupDue(iso: string): string {
  const d = new Date(iso);
  const days = Math.floor((d.getTime() - Date.now()) / 86400000);
  const t = d.toLocaleString("bg-BG", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  if (days < 0) return `просрочен · ${t}`;
  if (days === 0) return `днес · ${t}`;
  if (days === 1) return `утре · ${t}`;
  return t;
}

type FilterKey = "all" | "sent_not_heard" | "overdue" | "ready" | "needs_call";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "Всички" },
  { key: "sent_not_heard", label: "Изпратено, но не чуто" },
  { key: "overdue", label: "Просрочени" },
  { key: "needs_call", label: "Да се чуят" },
  { key: "ready", label: "Готови за затваряне" },
];

export function FollowupQueue({ rows }: { rows: FollowupRow[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => {
    return {
      all: rows.length,
      sent_not_heard: rows.filter(isSentNotHeard).length,
      overdue: rows.filter(isOverdue).length,
      needs_call: rows.filter((r) => r.followup_status === "needs_call" || isOverdue(r)).length,
      ready: rows.filter((r) => r.followup_status === "ready_to_close").length,
    } as Record<FilterKey, number>;
  }, [rows]);

  const visible = useMemo(() => {
    const list = rows.filter((r) => {
      switch (filter) {
        case "sent_not_heard":
          return isSentNotHeard(r);
        case "overdue":
          return isOverdue(r);
        case "needs_call":
          return r.followup_status === "needs_call" || isOverdue(r);
        case "ready":
          return r.followup_status === "ready_to_close";
        default:
          return true;
      }
    });
    return list.sort((a, b) => {
      const ao = isOverdue(a) ? 0 : 1;
      const bo = isOverdue(b) ? 0 : 1;
      if (ao !== bo) return ao - bo;
      const ap = STAGE_PRIORITY[a.stage] ?? 9;
      const bp = STAGE_PRIORITY[b.stage] ?? 9;
      if (ap !== bp) return ap - bp;
      const aAt = a.last_sent_at ?? a.updated_at;
      const bAt = b.last_sent_at ?? b.updated_at;
      return new Date(bAt).getTime() - new Date(aAt).getTime();
    });
  }, [rows, filter]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              borderColor: filter === f.key ? "var(--color-accent-cyan)" : "var(--color-border-default)",
              background: filter === f.key ? "rgba(0,212,255,0.10)" : "transparent",
              color: filter === f.key ? "var(--color-accent-cyan)" : "var(--color-text-secondary)",
            }}
          >
            {f.label}
            <span className="font-mono text-[10px] opacity-70">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((r) => (
          <FollowupCard key={r.id} row={r} />
        ))}
        {visible.length === 0 && (
          <p className="rounded-lg border border-dashed border-[var(--color-border-default)] p-8 text-center text-sm text-[var(--color-text-tertiary)]">
            Няма контакти за този филтър.
          </p>
        )}
      </div>

      <p className="mt-4 text-xs text-[var(--color-text-tertiary)]">
        Показани: {visible.length} от {rows.length} · подредени по приоритет (просрочени → етап на сделка)
      </p>
    </div>
  );
}

function FollowupCard({ row: r }: { row: FollowupRow }) {
  const overdue = isOverdue(r);
  const heard = isHeard(r);
  return (
    <div
      className="rounded-xl border p-4 transition-colors"
      style={{
        borderColor: overdue ? "rgba(239,68,68,0.4)" : "var(--color-border-default)",
        background: overdue ? "rgba(239,68,68,0.05)" : "rgba(13,18,33,0.4)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Identity */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/clients/${r.id}`}
              className="font-medium text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-accent-cyan)]"
            >
              {r.full_name || r.email || "—"}
            </Link>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: `${STAGE_COLOR[r.stage]}22`, color: STAGE_COLOR[r.stage] }}
            >
              {STAGE_LABEL[r.stage]}
            </span>
            {r.followup_status && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  background: `${FOLLOWUP_STATUS_COLOR[r.followup_status]}22`,
                  color: FOLLOWUP_STATUS_COLOR[r.followup_status],
                }}
              >
                {FOLLOWUP_STATUS_LABEL[r.followup_status]}
              </span>
            )}
            {heard && (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                ✓ чут
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-[var(--color-text-tertiary)]">
            {r.company && <span>🏢 {r.company}</span>}
            {r.email && <span className="font-mono">{r.email}</span>}
            {r.phone && <span className="font-mono">{r.phone}</span>}
          </div>
        </div>

        {/* Status column */}
        <div className="text-right text-[11px]">
          {r.last_sent_at && (
            <p className="text-[var(--color-text-secondary)]">
              {ACTIVITY_LABEL[r.last_sent_type ?? ""] ?? "Изпратено"} · {relative(r.last_sent_at)}
            </p>
          )}
          {r.next_followup_at && (
            <p className={overdue ? "font-medium text-red-300" : "text-[var(--color-text-tertiary)]"}>
              ⏰ {followupDue(r.next_followup_at)}
            </p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-3">
        <QuickButton contactId={r.id} action="mark_called" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10">
          📞 Чух го
        </QuickButton>
        <QuickButton contactId={r.id} action="asked_feedback" className="border-violet-500/40 text-violet-300 hover:bg-violet-500/10">
          💬 Поисках мнение
        </QuickButton>
        <QuickButton contactId={r.id} action="wants_changes" className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10">
          ✏️ Иска промени
        </QuickButton>
        <QuickButton contactId={r.id} action="ready_to_buy" className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10">
          🎉 Готов да купи
        </QuickButton>
        <SetNextCall contactId={r.id} />
        <Link
          href={`/admin/email?to=${encodeURIComponent(r.email ?? "")}`}
          className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-cyan)]/60 hover:text-[var(--color-accent-cyan)]"
        >
          ✉️ Follow-up имейл
        </Link>
        <QuickButton contactId={r.id} action="not_interested" className="ml-auto border-white/10 text-[var(--color-text-tertiary)] hover:bg-white/5">
          ✕ Не се интересува
        </QuickButton>
      </div>
    </div>
  );
}

function QuickButton({
  contactId,
  action,
  className,
  children,
}: {
  contactId: string;
  action: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form action={followupQuickAction} className="inline">
      <input type="hidden" name="contact_id" value={contactId} />
      <input type="hidden" name="action" value={action} />
      <button
        type="submit"
        className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs transition-colors ${className ?? ""}`}
      >
        {children}
      </button>
    </form>
  );
}

function SetNextCall({ contactId }: { contactId: string }) {
  return (
    <form action={followupQuickAction} className="inline-flex items-center gap-1">
      <input type="hidden" name="contact_id" value={contactId} />
      <input type="hidden" name="action" value="set_next_call" />
      <input
        type="datetime-local"
        name="next_call_at"
        required
        className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-cyan)]/60"
      />
      <button
        type="submit"
        className="inline-flex items-center gap-1 rounded-md border border-sky-500/40 px-2.5 py-1 text-xs text-sky-300 transition-colors hover:bg-sky-500/10"
      >
        📅 Насрочи
      </button>
    </form>
  );
}
