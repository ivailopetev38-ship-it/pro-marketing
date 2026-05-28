"use client";
import { useEffect, useState } from "react";
import { TiltCard } from "@/components/effects/TiltCard";
import { SectionReveal } from "@/components/effects/SectionReveal";

interface PainPoint {
  icon: string;
  task: string;
  detail: string;
  hoursManual: number;       // часове на месец на ръка
  hoursWithAi: number;       // часове на месец надзор + поправки
}

const PAINS: PainPoint[] = [
  {
    icon: "💬",
    task: "Отговори в Messenger / Viber / Instagram",
    detail: "На едни и същи въпроси по 50 пъти на ден",
    hoursManual: 88,
    hoursWithAi: 6,
  },
  {
    icon: "📱",
    task: "Постове и reels всеки ден",
    detail: "Текст, визия, хаштагове, календар — ръчно",
    hoursManual: 66,
    hoursWithAi: 8,
  },
  {
    icon: "✉️",
    task: "Проследяващи имейли до лидове",
    detail: '"Кога ще се чуем", "имаш ли време", "напомням"',
    hoursManual: 33,
    hoursWithAi: 2,
  },
  {
    icon: "📅",
    task: "Запис на срещи и потвърждения",
    detail: "Обаждания за час, преразпределения, неявяване",
    hoursManual: 44,
    hoursWithAi: 3,
  },
  {
    icon: "🎯",
    task: "Сортиране на лидове по приоритет",
    detail: "Кой е готов да купи, кой губи времето ти",
    hoursManual: 44,
    hoursWithAi: 4,
  },
  {
    icon: "⭐",
    task: "Отговор на ревюта и коментари",
    detail: "Google, Booking, TripAdvisor, Facebook",
    hoursManual: 15,
    hoursWithAi: 2,
  },
  {
    icon: "📊",
    task: "Седмични отчети и анализи",
    detail: "Excel формули, графики, обобщение за директора",
    hoursManual: 16,
    hoursWithAi: 1,
  },
  {
    icon: "🧾",
    task: "Фактуриране и счетоводна администрация",
    detail: "Издаване, изпращане, проследяване на плащания",
    hoursManual: 44,
    hoursWithAi: 4,
  },
];

const totalManual = PAINS.reduce((s, p) => s + p.hoursManual, 0);
const totalWithAi = PAINS.reduce((s, p) => s + p.hoursWithAi, 0);
const totalSaved = totalManual - totalWithAi;
const avgPercent = Math.round((totalSaved / totalManual) * 100);

export function PainPoints() {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1800;
    const animate = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.floor(totalSaved * eased));
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative overflow-hidden py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 15% 30%, rgba(239,68,68,0.08) 0%, transparent 45%), radial-gradient(ellipse at 85% 70%, rgba(34,197,94,0.08) 0%, transparent 45%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <SectionReveal>
          <div className="mb-12 max-w-3xl">
            <p
              className="mb-3 font-mono text-xs uppercase tracking-[0.2em]"
              style={{ color: "#ef4444" }}
            >
              {"// колко часа седят в рутина"}
            </p>
            <h2
              className="font-display text-[clamp(32px,7vw,68px)] font-bold leading-[1.04] tracking-tight"
              style={{ overflowWrap: "break-word", hyphens: "auto" }}
            >
              Колко часа от месеца<br />
              <span style={{ color: "#ef4444" }}>горят</span> в ръчна работа?
            </h2>
            <p className="mt-5 text-base text-[var(--color-text-secondary)] md:text-lg">
              Един човек прави едни и същи задачи всеки ден — отнема му часове, които не остават
              за стратегия и растеж. AI агент ги поема{" "}
              <span className="font-semibold text-[var(--color-text-primary)]">за минути</span>.
              Ето колко време ще си върнеш:
            </p>
          </div>
        </SectionReveal>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {PAINS.map((p, i) => {
            const saved = p.hoursManual - p.hoursWithAi;
            const pct = Math.round((saved / p.hoursManual) * 100);
            return (
              <SectionReveal key={p.task} delay={i * 60}>
                <TiltCard className="h-full rounded-2xl">
                  <div className="glass relative h-full overflow-hidden rounded-2xl p-6 md:p-7">
                    <div
                      className="absolute right-0 top-0 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider"
                      style={{
                        background: "rgba(34,197,94,0.15)",
                        color: "#22c55e",
                        borderBottomLeftRadius: "0.75rem",
                      }}
                    >
                      −{pct}%
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="text-3xl" aria-hidden>{p.icon}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-bold leading-tight">
                          {p.task}
                        </h3>
                        <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{p.detail}</p>
                      </div>
                    </div>

                    {/* Time comparison */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div
                        className="rounded-lg border p-3"
                        style={{
                          borderColor: "rgba(239,68,68,0.25)",
                          background: "rgba(239,68,68,0.06)",
                        }}
                      >
                        <p
                          className="font-mono text-[10px] uppercase tracking-[0.2em]"
                          style={{ color: "#ef4444" }}
                        >
                          Ръчно / месец
                        </p>
                        <p
                          className="mt-1 font-display text-2xl font-extrabold line-through decoration-2"
                          style={{
                            color: "#ef4444",
                            textDecorationColor: "rgba(239,68,68,0.6)",
                          }}
                        >
                          {p.hoursManual}ч
                        </p>
                        <p className="mt-0.5 text-[10px] text-[var(--color-text-tertiary)]">
                          ≈ {Math.round(p.hoursManual / 22 * 10) / 10}ч/ден
                        </p>
                      </div>
                      <div
                        className="rounded-lg border p-3"
                        style={{
                          borderColor: "rgba(34,197,94,0.30)",
                          background: "rgba(34,197,94,0.08)",
                        }}
                      >
                        <p
                          className="font-mono text-[10px] uppercase tracking-[0.2em]"
                          style={{ color: "#22c55e" }}
                        >
                          С AI / месец
                        </p>
                        <p
                          className="mt-1 font-display text-2xl font-extrabold"
                          style={{ color: "#22c55e" }}
                        >
                          {p.hoursWithAi}ч
                        </p>
                        <p className="mt-0.5 text-[10px] text-[var(--color-text-tertiary)]">
                          само надзор + одобрение
                        </p>
                      </div>
                    </div>

                    {/* Visual progress bar */}
                    <div className="mt-4">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-void)]/60">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background:
                              "linear-gradient(90deg, #22c55e 0%, #06b6d4 100%)",
                            boxShadow: "0 0 8px rgba(34,197,94,0.4)",
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border-default)] pt-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
                        Спестено време
                      </span>
                      <span
                        className="font-display text-lg font-bold"
                        style={{ color: "#22c55e" }}
                      >
                        {saved}ч ({pct}%) / месец
                      </span>
                    </div>
                  </div>
                </TiltCard>
              </SectionReveal>
            );
          })}
        </div>

        {/* Total hero */}
        <SectionReveal delay={200}>
          <div
            className="mt-12 overflow-hidden rounded-3xl border p-8 md:p-12"
            style={{
              borderColor: "rgba(34,197,94,0.35)",
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.10) 0%, rgba(6,182,212,0.06) 100%), var(--color-bg-glass)",
              boxShadow: "0 0 60px rgba(34,197,94,0.10)",
            }}
          >
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-center md:gap-12">
              <div>
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: "#22c55e" }}
                >
                  Общо спестено време / месец
                </p>
                <p
                  className="mt-3 font-display text-5xl font-extrabold leading-none tracking-tight md:text-7xl"
                  style={{ color: "#22c55e" }}
                >
                  {displayed}ч <span className="text-3xl md:text-5xl">({avgPercent}%)</span>
                </p>
                <p className="mt-3 text-sm text-[var(--color-text-secondary)] md:text-base">
                  ≈{" "}
                  <span className="font-bold text-[var(--color-text-primary)]">
                    {Math.round(totalSaved / 22)} работни дни
                  </span>{" "}
                  всеки месец, които оставят на човек да върши{" "}
                  <span className="font-bold text-[var(--color-text-primary)]">
                    стратегическа работа
                  </span>
                  , а не рутина.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center md:gap-6">
                <Stat label="Ръчно/мес" value={`${totalManual}ч`} color="#ef4444" />
                <Stat label="С AI/мес" value={`${totalWithAi}ч`} color="#22c55e" />
                <Stat label="Свободни дни" value={`${Math.round(totalSaved / 8)}д`} color="var(--color-accent-cyan)" />
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-[var(--color-text-tertiary)]">
              * Часовете са усреднени за малки и средни фирми в България. Изчисленията предполагат
              22 работни дни в месеца.
            </p>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p
        className="mt-1 font-display text-lg font-bold md:text-2xl"
        style={{ color }}
      >
        {value}
      </p>
    </div>
  );
}
