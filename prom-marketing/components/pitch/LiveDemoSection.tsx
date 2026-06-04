"use client";
import { motion } from "motion/react";
import { SectionReveal } from "@/components/effects/SectionReveal";
import { HolographicText } from "@/components/effects/HolographicText";
import { Bot, Filter, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/* --------------------------------------------------------------------------
   Live product mockups for the pitch page. Everything here is illustrative —
   no real client data. Customers shown are anonymous/fictional. The real CRM
   with real contacts lives only in /admin.
-------------------------------------------------------------------------- */

function MockWindow({
  label,
  accent,
  children,
}: {
  label: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/60 shadow-[0_0_60px_-24px_rgba(6,182,212,0.4)]">
      <div className="flex items-center justify-between border-b border-white/5 bg-black/40 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
        </div>
        <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">{label}</span>
        <span
          className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider"
          style={{ color: accent }}
        >
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
          />
          на живо
        </span>
      </div>
      <div className="min-h-[360px]">{children}</div>
    </div>
  );
}

function ChatViz() {
  const msgs: Array<{ from: "in" | "ai"; text: string }> = [
    { from: "in", text: "Здравейте! Колко струва AI чатбот за онлайн магазин?" },
    {
      from: "ai",
      text: "Здравейте! 👋 За магазин обикновено поемаме над 80% от запитванията автоматично. Искате ли да ви покажа на безплатно демо?",
    },
    { from: "in", text: "Да, кога може?" },
    { from: "ai", text: "Утре 14:00 или четвъртък 11:00? 📅" },
    { from: "in", text: "Утре 14:00 👍" },
    {
      from: "ai",
      text: "Готово! ✅ Резервирах срещата и пратих Google Meet линк на имейла ви.",
    },
  ];
  return (
    <div className="flex flex-col gap-2.5 p-5">
      {msgs.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.22 * i, duration: 0.35 }}
          className={m.from === "ai" ? "flex justify-start" : "flex justify-end"}
        >
          <div
            className={
              m.from === "ai"
                ? "max-w-[82%] rounded-2xl rounded-bl-md border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs text-[var(--color-text-primary)] md:text-sm"
                : "max-w-[82%] rounded-2xl rounded-br-md bg-white/10 px-3.5 py-2 text-xs text-[var(--color-text-secondary)] md:text-sm"
            }
          >
            {m.from === "ai" && (
              <span className="mb-0.5 block font-mono text-[9px] uppercase tracking-wider text-cyan-300">
                AI агент
              </span>
            )}
            {m.text}
          </div>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.22 * msgs.length, duration: 0.4 }}
        className="mt-2 inline-flex w-fit items-center gap-2 self-center rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[11px] text-emerald-300"
      >
        ⚡ Среден отговор: 3 сек · среща резервирана от агента
      </motion.div>
    </div>
  );
}

function ScoringViz() {
  const leads: Array<{
    co: string;
    ini: string;
    score: number;
    tag: string;
    reason: string;
    color: string;
  }> = [
    {
      co: "Делта Логистикс",
      ini: "ДЛ",
      score: 92,
      tag: "Горещ",
      reason: "Отвори офертата 4× · бюджет потвърден · отговаря бързо",
      color: "#ec4899",
    },
    {
      co: "Урбан Фитнес",
      ini: "УФ",
      score: 74,
      tag: "Топъл",
      reason: "Активен в чата · разглежда цени втори път",
      color: "#facc15",
    },
    {
      co: "Аврора Студио",
      ini: "АС",
      score: 38,
      tag: "Студен",
      reason: "Само разгледа · без отговор 5 дни → nurture",
      color: "#7da8cc",
    },
  ];
  return (
    <div className="flex flex-col gap-3 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
        🧠 AI скоринг · приоритет в реално време
      </p>
      {leads.map((l, i) => (
        <motion.div
          key={l.co}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.18 * i, duration: 0.4 }}
          className="rounded-xl border border-white/10 bg-black/40 p-3"
        >
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ background: `${l.color}25`, color: l.color }}
            >
              {l.ini}
            </span>
            <span className="flex-1 truncate text-sm font-medium text-[var(--color-text-primary)]">
              {l.co}
            </span>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
              style={{ background: `${l.color}1f`, color: l.color }}
            >
              {l.tag}
            </span>
            <span
              className="w-9 shrink-0 text-right font-mono text-sm font-bold"
              style={{ color: l.color }}
            >
              {l.score}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full"
              style={{ background: l.color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${l.score}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.18 * i + 0.15, duration: 0.9, ease: "easeOut" }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-[var(--color-text-tertiary)]">{l.reason}</p>
        </motion.div>
      ))}
      <div className="inline-flex w-fit items-center gap-2 self-start rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[11px] text-emerald-300">
        ⚡ Продажбите виждат само горещите · 0 пропуснати
      </div>
    </div>
  );
}

function FlowViz() {
  const steps: Array<{ icon: string; title: string; meta: string; color: string }> = [
    { icon: "📥", title: "Нов лийд от Meta", meta: "Facebook / Instagram реклама", color: "#1877F2" },
    { icon: "🧠", title: "AI квалифицира", meta: "скоринг + сегмент за 1 сек", color: "#06b6d4" },
    { icon: "🗂️", title: "Запис в CRM", meta: "контакт + източник + бележки", color: "#22c55e" },
    { icon: "✉️", title: "Welcome имейл", meta: "персонализиран, авто-пратен", color: "#a78bfa" },
    { icon: "📅", title: "Среща в календара", meta: "Google Meet линк генериран", color: "#facc15" },
  ];
  return (
    <div className="p-6">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
        ⚙️ Автоматичен поток · от клик до среща
      </p>
      <div className="relative space-y-2.5">
        <span
          aria-hidden
          className="absolute left-[18px] top-2 h-[calc(100%-1.5rem)] w-px bg-gradient-to-b from-[#1877F2] via-[#22c55e] to-[#facc15] opacity-40"
        />
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 * i, duration: 0.35 }}
            className="relative flex items-center gap-3 rounded-lg border border-white/10 bg-black/40 p-3"
          >
            <span
              className="z-10 flex h-9 w-9 items-center justify-center rounded-lg text-base"
              style={{ background: `${s.color}25`, color: s.color }}
            >
              {s.icon}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{s.title}</p>
              <p className="text-[11px] text-[var(--color-text-tertiary)]">{s.meta}</p>
            </div>
            <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">
              0{i + 1}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[11px] text-emerald-300">
        ⚡ 5 действия · ~8 секунди · 0 ръчни стъпки
      </div>
    </div>
  );
}

interface Feature {
  icon: LucideIcon;
  badge: string;
  title: string;
  body: string;
  bullets: string[];
  accent: string;
  label: string;
  viz: ReactNode;
  reverse?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: Bot,
    badge: "AI чат агент",
    title: "Отговаря, квалифицира и резервира — сам.",
    body: "Денонощен агент в Messenger, Instagram, Viber и на сайта. Разбира въпроса, дава точен отговор и закарва клиента до резервирана среща, без човек да пипне нищо.",
    bullets: ["Български + 40 езика", "Помни целия разговор", "Резервира в Cal.com"],
    accent: "var(--color-accent-cyan)",
    label: "messenger · AI агент",
    viz: <ChatViz />,
  },
  {
    icon: Filter,
    badge: "AI квалификация",
    title: "Знае кой ще купи — преди теб.",
    body: "Всеки лийд получава скор в реално време от поведението си. Продажбите ти виждат само горещите; останалите AI ги топли автоматично, докато узреят.",
    bullets: ["Скоринг в реално време", "Приоритет по поведение", "Nurture на автопилот"],
    accent: "var(--color-accent-violet)",
    label: "lead scoring · приоритизация",
    viz: <ScoringViz />,
    reverse: true,
  },
  {
    icon: Workflow,
    badge: "Автоматизации",
    title: "От клик по реклама до среща — без ръце.",
    body: "Всеки нов лийд минава по релси: AI го квалифицира, записва го в CRM-а, праща персонален имейл и слага среща в календара. Ти получаваш готова среща, не задача.",
    bullets: ["Cross-system orchestration", "0 ръчно копиране", "Нищо не се губи"],
    accent: "var(--color-accent-magenta)",
    label: "automation · поток",
    viz: <FlowViz />,
  },
];

export function LiveDemoSection() {
  return (
    <section id="live" className="relative py-32 md:py-44">
      <div className="mx-auto max-w-6xl px-6">
        <SectionReveal>
          <div className="mb-20 max-w-3xl">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent-cyan)]">
              {"// виж го на живо"}
            </p>
            <h2 className="font-display text-[clamp(34px,6vw,80px)] font-bold leading-[1.02] tracking-tight">
              Не описания.
              <br />
              <HolographicText>Демо.</HolographicText>
            </h2>
            <p className="mt-8 text-lg text-[var(--color-text-secondary)]">
              Ето как изглеждат агентите в действие — точно това, което ще работи за теб 24/7.
            </p>
          </div>
        </SectionReveal>

        <div className="space-y-20 md:space-y-28">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <SectionReveal key={f.title} delay={i * 80}>
                <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                  <div className={f.reverse ? "lg:order-2" : ""}>
                    <span
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]"
                      style={{
                        borderColor: `color-mix(in srgb, ${f.accent} 40%, transparent)`,
                        background: `color-mix(in srgb, ${f.accent} 12%, transparent)`,
                        color: f.accent,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
                      {f.badge}
                    </span>
                    <h3 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                      {f.title}
                    </h3>
                    <p className="mt-4 max-w-xl text-base text-[var(--color-text-secondary)] md:text-lg">
                      {f.body}
                    </p>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {f.bullets.map((b) => (
                        <li
                          key={b}
                          className="rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] px-3 py-1 text-xs text-[var(--color-text-secondary)]"
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={f.reverse ? "lg:order-1" : ""}>
                    <MockWindow label={f.label} accent={f.accent}>
                      {f.viz}
                    </MockWindow>
                  </div>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
