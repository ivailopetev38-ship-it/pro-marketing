import { CounterRamp } from "@/components/effects/CounterRamp";

const STATS = [
  { target: 7, suffix: "", label: "AI агента на смяна", color: "#06b6d4" },
  { target: 24, suffix: "/7", label: "Без почивка, без отпуск", color: "#a78bfa" },
  { target: 12, suffix: "ч", label: "Спестени седмично", color: "#22c55e" },
  { target: 90, suffix: "%", label: "От рутината — на AI", color: "#facc15" },
];

export function TrustStrip() {
  return (
    <section className="relative overflow-hidden border-y border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/40 py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.08) 0%, transparent 60%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="group flex flex-col items-center text-center md:items-start md:text-left">
            <span
              className="font-display text-4xl font-bold tracking-tight transition-all md:text-5xl"
              style={{ color: s.color }}
            >
              <CounterRamp target={s.target} suffix={s.suffix} />
            </span>
            <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] md:text-xs">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
