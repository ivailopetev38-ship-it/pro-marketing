const REASONS = [
  {
    title: "Не работим с конкурент",
    body: "След подпис на тази оферта, не приемаме друг клиент за луксозно спално бельо в България минимум 12 месеца. Твоят пазар — твой остава.",
  },
  {
    title: "Виждаме сайтa като жив",
    body: "След старта продължаваме да го развиваме. Месечни оптимизации, нови функционалности, кампании. Сайтът ти расте, ние сме до теб.",
  },
  {
    title: "Стойност, не просто цена",
    body: "За цената на 4-5 рекламни кампании във Facebook получаваш дигитален магазин, който работи 24/7 без рекламен бюджет.",
  },
  {
    title: "Прозрачност на всеки етап",
    body: `Виждаш всичко — от първата скица до последния ред код. Без сюрпризи, без „това не беше включено".`,
  },
];

export function WhyPartner() {
  return (
    <section className="relative border-y border-[var(--color-border-default)] bg-[var(--color-bg-deep)] py-28 md:py-40">
      <div className="mx-auto max-w-5xl px-6 md:px-12">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.4em] text-[var(--color-accent-magenta)]">
          05 · Защо партньорство
        </p>

        <h2 className="font-[family-name:var(--font-editorial)] text-[clamp(36px,7vw,80px)] font-light leading-[1.05]">
          Не сме <span className="italic">studio</span>.<br />
          Сме твой <span className="italic">партньор</span>.
        </h2>

        <div className="mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-[var(--color-border-default)] bg-[var(--color-border-default)] md:grid-cols-2">
          {REASONS.map((r, i) => (
            <div
              key={r.title}
              className="flex flex-col gap-4 bg-[var(--color-bg-void)] p-8 md:p-12"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-text-tertiary)]">
                Причина {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-[family-name:var(--font-editorial)] text-2xl font-medium leading-tight text-[var(--color-text-primary)] md:text-3xl">
                {r.title}
              </h3>
              <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
