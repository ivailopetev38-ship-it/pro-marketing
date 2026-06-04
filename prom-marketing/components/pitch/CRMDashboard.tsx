"use client";
import { motion } from "motion/react";
import { SectionReveal } from "@/components/effects/SectionReveal";
import { HolographicText } from "@/components/effects/HolographicText";

/* --------------------------------------------------------------------------
   The hero "product shot" of the pitch — a dense, beautiful CRM command center
   built entirely in code. Every name, company and number is fictional /
   illustrative. The real CRM with real contacts lives only in /admin.
-------------------------------------------------------------------------- */

const NAV: Array<{ label: string; icon: string; active?: boolean }> = [
  { label: "Табло", icon: "▦", active: true },
  { label: "Клиенти", icon: "◎" },
  { label: "Сделки", icon: "◈" },
  { label: "Срещи", icon: "◷" },
  { label: "Имейли", icon: "✉" },
  { label: "Анализи", icon: "📈" },
];

const KPIS: Array<{ label: string; value: string; delta: string; color: string }> = [
  { label: "Pipeline", value: "€124,500", delta: "▲ 18%", color: "#facc15" },
  { label: "Активни сделки", value: "81", delta: "▲ 8", color: "#06b6d4" },
  { label: "Conversion", value: "42%", delta: "▲ 5", color: "#22c55e" },
  { label: "Срещи / месец", value: "23", delta: "▲ 7", color: "#a78bfa" },
];

const COLUMNS: Array<{
  name: string;
  color: string;
  total: string;
  deals: Array<{ co: string; ini: string; val: string; hot?: boolean }>;
}> = [
  {
    name: "Lead",
    color: "#7da8cc",
    total: "€4.7k",
    deals: [
      { co: "Аврора Студио", ini: "АС", val: "€1,200" },
      { co: "Техно Дом", ini: "ТД", val: "€3,500" },
    ],
  },
  {
    name: "Квалифициран",
    color: "#a78bfa",
    total: "€3.3k",
    deals: [
      { co: "Грийн Кафе", ini: "ГК", val: "€900" },
      { co: "Урбан Фитнес", ini: "УФ", val: "€2,400" },
    ],
  },
  {
    name: "Оферта",
    color: "#facc15",
    total: "€6.0k",
    deals: [{ co: "Делта Логистикс", ini: "ДЛ", val: "€6,000", hot: true }],
  },
  {
    name: "Преговори",
    color: "#fb923c",
    total: "€2.0k",
    deals: [{ co: "Био Маркет 24", ini: "БМ", val: "€2,000" }],
  },
  {
    name: "Спечелен",
    color: "#22c55e",
    total: "€1.5k",
    deals: [{ co: "Луна Бижу", ini: "ЛБ", val: "€1,500" }],
  },
];

const INSIGHTS: Array<{ icon: string; text: string; color: string }> = [
  { icon: "⚠️", text: "3 сделки застояли > 7 дни — да пусна ли follow-up?", color: "#fb923c" },
  { icon: "🔥", text: "„Делта Логистикс“ отвори офертата 4× — горещо.", color: "#ec4899" },
  { icon: "📈", text: "Прогноза за месеца: €18,400 · 87% увереност.", color: "#22c55e" },
];

function Spark({ color }: { color: string }) {
  const data = [4, 6, 5, 8, 7, 9, 8, 11, 10, 13, 12, 15];
  const w = 80;
  const h = 22;
  const max = Math.max(...data);
  const step = w / (data.length - 1);
  const pts = data
    .map((v, i) => `${i * step},${h - 2 - (v / max) * (h - 6)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-5 w-16" preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CRMDashboard() {
  return (
    <section className="relative overflow-hidden py-32 md:py-44">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 25%, rgba(6,182,212,0.08) 0%, transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionReveal>
          <div className="mb-14 max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent-cyan)]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
              </span>
              {"// твоят команден център"}
            </p>
            <h2 className="font-display text-[clamp(34px,6vw,80px)] font-bold leading-[1.02] tracking-tight">
              Един екран.
              <br />
              <HolographicText>Целият бизнес.</HolographicText>
            </h2>
            <p className="mt-8 text-lg text-[var(--color-text-secondary)]">
              Custom CRM, изграден за теб — а AI върши <span className="text-[var(--color-accent-cyan)]">90% от работата</span>. Лийдове, сделки, срещи, имейли и прогнози на едно място.
            </p>
          </div>
        </SectionReveal>

        <SectionReveal>
          <div className="relative">
            {/* ambient glow */}
            <div
              aria-hidden
              className="absolute -inset-3 rounded-[2rem] opacity-60 blur-2xl md:-inset-6"
              style={{
                background:
                  "linear-gradient(120deg, rgba(6,182,212,0.18), rgba(124,58,237,0.14), rgba(236,72,153,0.12))",
              }}
            />

            {/* frame */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-bg-deep)]/85 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.85)]">
              {/* top highlight */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
              />

              {/* browser chrome */}
              <div className="flex items-center justify-between border-b border-white/5 bg-black/40 px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">
                  promarketing.pw/admin · табло
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  на живо
                </span>
              </div>

              {/* body */}
              <div className="grid grid-cols-1 md:grid-cols-[172px_1fr]">
                {/* sidebar */}
                <aside className="hidden flex-col border-r border-white/5 bg-black/30 p-3 md:flex">
                  <div className="mb-5 flex items-center gap-2 px-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/30 to-violet-500/30 text-xs font-bold text-cyan-300">
                      PM
                    </span>
                    <span className="font-display text-sm font-bold">ProMarketing</span>
                  </div>
                  <nav className="space-y-1">
                    {NAV.map((n) => (
                      <div
                        key={n.label}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] ${
                          n.active
                            ? "bg-cyan-500/10 text-cyan-300"
                            : "text-[var(--color-text-tertiary)]"
                        }`}
                      >
                        <span className="text-sm">{n.icon}</span>
                        {n.label}
                      </div>
                    ))}
                  </nav>
                  <div className="mt-5 rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-3">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-300">
                      <span>✦</span> AI Co-pilot
                    </p>
                    <p className="mt-1 text-[10px] leading-snug text-[var(--color-text-tertiary)]">
                      Hermes оркестрира 6 агента
                    </p>
                  </div>
                </aside>

                {/* main */}
                <div className="p-4 md:p-5">
                  {/* topbar */}
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] text-[var(--color-text-tertiary)]">
                      <span>⌕</span>
                      <span className="truncate">Търси клиент, сделка, имейл…</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="hidden rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 font-mono text-[10px] text-cyan-300 sm:inline">
                        ✦ AI Co-pilot
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/25 text-[11px] font-bold text-violet-200">
                        ИП
                      </span>
                    </div>
                  </div>

                  {/* KPI row */}
                  <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                    {KPIS.map((k, i) => (
                      <motion.div
                        key={k.label}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.06 * i, duration: 0.4 }}
                        className="rounded-xl border border-white/10 bg-black/40 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
                            {k.label}
                          </p>
                          <span className="font-mono text-[9px] text-emerald-300">{k.delta}</span>
                        </div>
                        <div className="mt-1 flex items-end justify-between gap-2">
                          <p className="text-xl font-bold tracking-tight" style={{ color: k.color }}>
                            {k.value}
                          </p>
                          <Spark color={k.color} />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* kanban + AI panel */}
                  <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1.7fr_1fr]">
                    {/* pipeline kanban */}
                    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                      <div className="mb-2.5 flex items-center justify-between">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
                          ◈ Pipeline · 81 сделки
                        </p>
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[9px] text-emerald-300">
                          AI премества стадии
                        </span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {COLUMNS.map((col, ci) => (
                          <div key={col.name} className="min-w-[136px] flex-1">
                            <div className="mb-1.5 flex items-center justify-between">
                              <span
                                className="font-mono text-[10px] uppercase tracking-wider"
                                style={{ color: col.color }}
                              >
                                {col.name}
                              </span>
                              <span className="font-mono text-[9px] text-[var(--color-text-tertiary)]">
                                {col.total}
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {col.deals.map((d, di) => (
                                <motion.div
                                  key={d.co}
                                  initial={{ opacity: 0, y: 8 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: 0.05 * (ci + di), duration: 0.35 }}
                                  className="rounded-lg border bg-black/40 p-2"
                                  style={{ borderColor: d.hot ? `${col.color}66` : "rgba(255,255,255,0.08)" }}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold"
                                      style={{ background: `${col.color}25`, color: col.color }}
                                    >
                                      {d.ini}
                                    </span>
                                    <span className="truncate text-[11px] font-medium text-[var(--color-text-primary)]">
                                      {d.co}
                                    </span>
                                  </div>
                                  <div className="mt-1.5 flex items-center justify-between">
                                    <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
                                      {d.val}
                                    </span>
                                    {d.hot && <span className="text-[9px]">🔥</span>}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI co-pilot panel */}
                    <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.07] to-violet-500/[0.05] p-3">
                      <div className="mb-2.5 flex items-center justify-between">
                        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                          <span>✦</span> AI Co-pilot
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[9px] text-emerald-300">
                          <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
                          активен
                        </span>
                      </div>
                      <div className="space-y-2">
                        {INSIGHTS.map((ins, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 8 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.12 * i + 0.2, duration: 0.35 }}
                            className="flex items-start gap-2 rounded-lg border p-2"
                            style={{ borderColor: `${ins.color}33`, background: `${ins.color}0d` }}
                          >
                            <span className="text-xs">{ins.icon}</span>
                            <p className="text-[11px] leading-snug text-[var(--color-text-secondary)]">
                              {ins.text}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                      <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-cyan-300">✍️ Пиша 5 follow-up имейла</span>
                          <span className="inline-flex gap-1">
                            {[0, 1, 2].map((d) => (
                              <motion.span
                                key={d}
                                className="h-1 w-1 rounded-full bg-cyan-300"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                              />
                            ))}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[10px] text-[var(--color-text-tertiary)]">
                          готови за преглед · ти само одобряваш
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* stat chips under the shot */}
        <SectionReveal delay={150}>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {[
              "⏱️ 12-15ч/седмица спестени",
              "🤖 AI прави 90% от работата",
              "🔌 Всички канали на едно място",
              "📊 Real-time данни & прогнози",
            ].map((c) => (
              <span
                key={c}
                className="rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] px-3.5 py-1.5 text-[12px] text-[var(--color-text-secondary)]"
              >
                {c}
              </span>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
