// SVG sparkline — small line+area chart used inside KPI cards or in dashboard
// activity widgets. Renders fixed coordinates so it scales cleanly with width.

export interface SparklinePoint {
  date: string; // YYYY-MM-DD (used only for tooltips/labels)
  value: number;
}

export function Sparkline({
  points,
  color = "var(--color-accent-cyan)",
  height = 60,
  showAxis = false,
}: {
  points: SparklinePoint[];
  color?: string;
  height?: number;
  showAxis?: boolean;
}) {
  if (points.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-md border border-dashed border-[var(--color-border-default)] text-xs text-[var(--color-text-tertiary)]"
        style={{ height }}
      >
        Няма данни
      </div>
    );
  }

  const max = Math.max(...points.map((p) => p.value), 1);
  const min = 0;
  const range = max - min || 1;

  const width = 100;
  const stepX = width / Math.max(points.length - 1, 1);
  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = height - 8 - ((p.value - min) / range) * (height - 16);
    return [x, y] as const;
  });

  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      <defs>
        <linearGradient id="spark-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#spark-area)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === coords.length - 1 ? 2 : 0.8}
          fill={color}
        />
      ))}
      {showAxis && (
        <line
          x1={0}
          y1={height - 2}
          x2={width}
          y2={height - 2}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.4"
        />
      )}
    </svg>
  );
}
