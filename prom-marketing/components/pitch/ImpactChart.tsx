"use client";
import { motion } from "motion/react";
import { SectionReveal } from "@/components/effects/SectionReveal";
import { HolographicText } from "@/components/effects/HolographicText";

// Illustrative figures — typical movement in the first months after the AI
// infrastructure goes live. Higher is better on every row.
const ROWS: Array<{ label: string; before: number; after: number }> = [
  { label: "Запитвания, обработени без човек", before: 20, after: 82 },
  { label: "Лийдове с отговор под 1 минута", before: 12, after: 95 },
  { label: "Седмично време за растеж, не рутина", before: 25, after: 85 },
  { label: "Доволни клиенти (CSAT)", before: 64, after: 93 },
];

export function ImpactChart() {
  return (
    <section className="relative border-y border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/30 py-32 md:py-44">
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="relative mx-auto max-w-5xl px-6">
        <SectionReveal>
          <div className="mb-16 max-w-3xl">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent-cyan)]">
              {"// преди / след AI"}
            </p>
            <h2 className="font-display text-[clamp(34px,6vw,80px)] font-bold leading-[1.02] tracking-tight">
              Същият екип.
              <br />
              <HolographicText>Друг бизнес.</HolographicText>
            </h2>
            <p className="mt-8 text-lg text-[var(--color-text-secondary)]">
              Не сменяш хората — даваш им AI инфраструктура. Ето какво се променя в първите месеци.
            </p>
          </div>
        </SectionReveal>

        <div className="space-y-9">
          {ROWS.map((r, i) => (
            <SectionReveal key={r.label} delay={i * 90}>
              <div>
                <p className="mb-3 text-sm font-medium text-[var(--color-text-primary)] md:text-base">
                  {r.label}
                </p>

                <div className="mb-2 flex items-center gap-3">
                  <span className="w-14 shrink-0 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Преди
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full rounded-full bg-white/20"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${r.before}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right font-mono text-xs text-[var(--color-text-tertiary)]">
                    {r.before}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-14 shrink-0 font-mono text-[10px] uppercase tracking-wider text-cyan-300">
                    С AI
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #06b6d4, #7c3aed)" }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${r.after}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right font-mono text-xs font-bold text-cyan-300">
                    {r.after}%
                  </span>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal delay={200}>
          <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
            * илюстративни стойности · реалните зависят от процесите ти
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
