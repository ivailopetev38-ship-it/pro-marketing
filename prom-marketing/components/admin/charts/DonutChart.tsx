// Pure-SVG donut chart with center label. No animation framework needed; the
// browser handles the stroke-dasharray transition.

interface Slice {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  slices,
  size = 140,
  thickness = 18,
  centerLabel,
  centerValue,
}: {
  slices: Slice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  // Precompute cumulative offsets so render stays pure (no reassignment).
  const segments = slices.map((s, i) => {
    const length = (s.value / total) * circumference;
    const offset = slices
      .slice(0, i)
      .reduce((acc, x) => acc + (x.value / total) * circumference, 0);
    return { ...s, length, offset };
  });

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={thickness}
        />
        {segments.map((s) => (
          <circle
            key={s.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${s.length} ${circumference}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
          />
        ))}
        <foreignObject x={0} y={0} width={size} height={size}>
          <div
            className="flex h-full w-full rotate-90 items-center justify-center"
            style={{ transform: "rotate(90deg)" }}
          >
            <div className="text-center">
              {centerValue && (
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {centerValue}
                </p>
              )}
              {centerLabel && (
                <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  {centerLabel}
                </p>
              )}
            </div>
          </div>
        </foreignObject>
      </svg>

      <ul className="space-y-1.5 text-xs">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: s.color }}
            />
            <span className="text-[var(--color-text-secondary)]">{s.label}</span>
            <span className="ml-auto font-mono text-[var(--color-text-primary)]">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
