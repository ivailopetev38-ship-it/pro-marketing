// KPI tile with an optional delta indicator and inline sparkline.
import { Sparkline, type SparklinePoint } from "./charts/Sparkline";

export interface KpiCardProps {
  label: string;
  value: number | string;
  hint?: string;
  /** Comparison number vs previous period — negative arrows red, positive green. */
  delta?: number | null;
  /** Force a custom color for the value (e.g. red when overdue > 0). */
  color?: string;
  /** Optional sparkline below the value. */
  trend?: SparklinePoint[];
  trendColor?: string;
  /** Make the whole card clickable */
  href?: string;
}

export function KpiCard({ label, value, hint, delta, color, trend, trendColor, href }: KpiCardProps) {
  const valueColor = color ?? "var(--color-text-primary)";
  const deltaTone =
    delta == null
      ? null
      : delta > 0
        ? "text-emerald-300"
        : delta < 0
          ? "text-red-300"
          : "text-[var(--color-text-tertiary)]";
  const deltaArrow = delta == null ? "" : delta > 0 ? "▲" : delta < 0 ? "▼" : "•";

  const body = (
    <div className="relative h-full overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/40 p-4 transition-colors hover:border-[var(--color-accent-cyan)]/60">
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
          {label}
        </p>
        {delta != null && (
          <span className={`font-mono text-[10px] ${deltaTone}`}>
            {deltaArrow} {Math.abs(delta)}
          </span>
        )}
      </div>
      <p className="mt-1 text-3xl font-bold tabular-nums" style={{ color: valueColor }}>
        {value}
      </p>
      {hint && <p className="text-[11px] text-[var(--color-text-tertiary)]">{hint}</p>}
      {trend && trend.length > 0 && (
        <div className="mt-2 -mx-1">
          <Sparkline points={trend} color={trendColor ?? valueColor} height={32} />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-cyan)]/60 rounded-xl">
        {body}
      </a>
    );
  }
  return body;
}
