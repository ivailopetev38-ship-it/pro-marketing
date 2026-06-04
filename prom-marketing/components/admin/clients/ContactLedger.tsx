"use client";
import { useState } from "react";
import Link from "next/link";
import type { InvoiceRow, PaymentRow, ManualReviewRow } from "@/lib/crm/types";
import {
  INVOICE_TYPE_LABEL,
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_COLOR,
  PAYMENT_MATCH_STATUS_LABEL,
  PAYMENT_MATCH_STATUS_COLOR,
  MANUAL_REVIEW_TYPE_LABEL,
  SEVERITY_COLOR,
  formatMoney,
  formatDate,
} from "@/lib/crm/labels";

type Tab = "invoices" | "payments" | "review";

export function ContactLedger({
  invoices,
  payments,
  reviews,
}: {
  invoices: InvoiceRow[];
  payments: PaymentRow[];
  reviews: ManualReviewRow[];
}) {
  const [tab, setTab] = useState<Tab>("invoices");

  const unpaid = invoices
    .filter((i) => ["sent", "awaiting_payment", "partially_paid", "overdue"].includes(i.status))
    .reduce((s, i) => s + (Number(i.amount_gross) || 0), 0);
  const paidTotal = payments
    .filter((p) => p.match_status !== "ignored")
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const tabs: Array<{ key: Tab; label: string; count: number }> = [
    { key: "invoices", label: "🧾 Фактури", count: invoices.length },
    { key: "payments", label: "💰 Плащания", count: payments.length },
    { key: "review", label: "🔍 Проверка", count: reviews.length },
  ];

  return (
    <section
      className="rounded-lg border border-[var(--color-border-default)] p-5"
      style={{ background: "rgba(13,18,33,0.4)" }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
              style={{
                borderColor: tab === t.key ? "var(--color-accent-cyan)" : "var(--color-border-default)",
                background: tab === t.key ? "rgba(0,212,255,0.10)" : "transparent",
                color: tab === t.key ? "var(--color-accent-cyan)" : "var(--color-text-secondary)",
              }}
            >
              {t.label}
              <span className="font-mono text-[10px] opacity-70">{t.count}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-4 text-[11px] text-[var(--color-text-tertiary)]">
          <span>
            Дължи: <span className="font-medium text-amber-300">{formatMoney(unpaid)}</span>
          </span>
          <span>
            Платил: <span className="font-medium text-emerald-300">{formatMoney(paidTotal)}</span>
          </span>
        </div>
      </div>

      {tab === "invoices" && <InvoicesList rows={invoices} />}
      {tab === "payments" && <PaymentsList rows={payments} />}
      {tab === "review" && <ReviewList rows={reviews} />}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-md border border-dashed border-[var(--color-border-default)] p-6 text-center text-xs text-[var(--color-text-tertiary)]">
      {text}
    </p>
  );
}

function InvoicesList({ rows }: { rows: InvoiceRow[] }) {
  if (rows.length === 0) return <Empty text="Няма фактури за този контакт." />;
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li
          key={r.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-border-default)] bg-black/20 px-3 py-2 text-sm"
        >
          <div className="min-w-0">
            <span className="font-mono text-xs text-[var(--color-text-primary)]">{r.invoice_number || "(без номер)"}</span>
            <span className="ml-2 text-[11px] text-[var(--color-text-tertiary)]">
              {INVOICE_TYPE_LABEL[r.invoice_type] ?? r.invoice_type} · {formatDate(r.issue_date)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium text-[var(--color-text-primary)]">{formatMoney(r.amount_gross, r.currency)}</span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: `${INVOICE_STATUS_COLOR[r.status]}22`, color: INVOICE_STATUS_COLOR[r.status] }}
            >
              {INVOICE_STATUS_LABEL[r.status] ?? r.status}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function PaymentsList({ rows }: { rows: PaymentRow[] }) {
  if (rows.length === 0) return <Empty text="Няма регистрирани плащания." />;
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li
          key={r.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-border-default)] bg-black/20 px-3 py-2 text-sm"
        >
          <div className="min-w-0">
            <span className="font-medium text-[var(--color-text-primary)]">{formatMoney(r.amount, r.currency)}</span>
            <span className="ml-2 text-[11px] text-[var(--color-text-tertiary)]">
              {formatDate(r.paid_at)}
              {r.counterparty_name ? ` · ${r.counterparty_name}` : ""}
            </span>
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              background: `${PAYMENT_MATCH_STATUS_COLOR[r.match_status]}22`,
              color: PAYMENT_MATCH_STATUS_COLOR[r.match_status],
            }}
          >
            {PAYMENT_MATCH_STATUS_LABEL[r.match_status] ?? r.match_status}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ReviewList({ rows }: { rows: ManualReviewRow[] }) {
  if (rows.length === 0) return <Empty text="Няма отворени неща за проверка." />;
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li
          key={r.id}
          className="flex items-center justify-between gap-2 rounded-md border border-[var(--color-border-default)] bg-black/20 px-3 py-2 text-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: SEVERITY_COLOR[r.severity] }} />
            <span className="truncate text-[var(--color-text-primary)]">{r.title}</span>
          </div>
          <span className="flex-shrink-0 text-[10px] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {MANUAL_REVIEW_TYPE_LABEL[r.type] ?? r.type}
          </span>
        </li>
      ))}
      <li className="pt-1 text-center">
        <Link href="/admin/manual-review" className="text-[11px] text-[var(--color-accent-cyan)] hover:underline">
          Към ръчната проверка →
        </Link>
      </li>
    </ul>
  );
}
