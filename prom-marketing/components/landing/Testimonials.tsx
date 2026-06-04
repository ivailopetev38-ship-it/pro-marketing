"use client";
import { motion } from "motion/react";
import { SectionReveal } from "@/components/effects/SectionReveal";

interface Testimonial {
  initials: string;
  name: string;
  role: string;
  industry: string;
  text: string;
  metric: { value: string; label: string };
  accent: string;
}

// Fictional testimonials, mirrored to the same demo personas used in
// CRMShowcase so the public-facing story stays consistent.
const TESTIMONIALS: Testimonial[] = [
  {
    initials: "МС",
    name: "Мария Стоянова",
    role: "Основател",
    industry: "Био магазин · онлайн",
    text: "AI агентите поеха разговорите в Messenger и Instagram. За 3 месеца — сделките се удвоиха. Не работя след 18:00, а продажбите растат.",
    metric: { value: "+108%", label: "месечни продажби" },
    accent: "#22c55e",
  },
  {
    initials: "НД",
    name: "Николай Димитров",
    role: "Управител",
    industry: "Туристическа агенция",
    text: "Преди прекарвах 20 часа в седмицата с резервации и follow-ups. Сега AI ги пише и потвърждава, а аз се занимавам с клиентите, които всъщност купуват.",
    metric: { value: "18ч", label: "спестени седмично" },
    accent: "#06b6d4",
  },
  {
    initials: "ЕТ",
    name: "Елена Тодорова",
    role: "Собственик",
    industry: "Бутик за бижута",
    text: "Instagram ботът качи лидове, които ръчно никога нямаше да хвана. CRM системата ми показва кои са горещи и автоматично им пише.",
    metric: { value: "+120%", label: "Instagram продажби" },
    accent: "#a78bfa",
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden border-y border-[var(--color-border-default)] py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 70% 30%, rgba(6,182,212,0.06) 0%, transparent 50%), radial-gradient(ellipse at 30% 80%, rgba(167,139,250,0.06) 0%, transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <SectionReveal>
          <div className="mb-14 max-w-2xl">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent-cyan)]">
              {"// какво казват клиентите"}
            </p>
            <h2
              className="font-display text-[clamp(28px,5vw,52px)] font-semibold leading-[1.08] tracking-tight"
              lang="bg"
            >
              Реални резултати, реални хора.
            </h2>
            <p className="mt-4 text-base text-[var(--color-text-secondary)] md:text-lg">
              Не показваме счупени метрики или дълги PR разкази. Само какво се промени в бизнеса им.
            </p>
          </div>
        </SectionReveal>

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <SectionReveal key={t.name} delay={i * 100}>
              <motion.article
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group relative h-full rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/40 p-6 transition-colors hover:border-white/20"
              >
                {/* Accent bar */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-60"
                  style={{ background: `linear-gradient(90deg, ${t.accent} 0%, transparent 80%)` }}
                />

                {/* 5 stars */}
                <div className="mb-4 flex gap-0.5" style={{ color: t.accent }}>
                  {[0, 1, 2, 3, 4].map((s) => (
                    <span key={s} className="text-sm">
                      ★
                    </span>
                  ))}
                </div>

                {/* Quote */}
                <p className="mb-5 text-sm leading-relaxed text-[var(--color-text-secondary)] md:text-[15px]">
                  „{t.text}"
                </p>

                {/* Metric chip */}
                <div
                  className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
                  style={{
                    borderColor: `${t.accent}40`,
                    background: `${t.accent}15`,
                  }}
                >
                  <span className="font-mono text-sm font-bold" style={{ color: t.accent }}>
                    {t.metric.value}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">
                    {t.metric.label}
                  </span>
                </div>

                {/* Footer: avatar + name */}
                <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: `${t.accent}25`, color: t.accent }}
                  >
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                      {t.name}
                    </p>
                    <p className="truncate text-[11px] text-[var(--color-text-tertiary)]">
                      {t.role} · {t.industry}
                    </p>
                  </div>
                </div>
              </motion.article>
            </SectionReveal>
          ))}
        </div>

        {/* Bottom trust strip — small touch */}
        <SectionReveal delay={400}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/5 pt-10 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
              Доверие от собственици на бизнеси в:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-[var(--color-text-secondary)]">
              <span>Е-търговия</span>
              <span className="text-[var(--color-text-tertiary)]">·</span>
              <span>Туризъм</span>
              <span className="text-[var(--color-text-tertiary)]">·</span>
              <span>Ресторанти</span>
              <span className="text-[var(--color-text-tertiary)]">·</span>
              <span>Имоти</span>
              <span className="text-[var(--color-text-tertiary)]">·</span>
              <span>Здраве</span>
              <span className="text-[var(--color-text-tertiary)]">·</span>
              <span>B2B услуги</span>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
