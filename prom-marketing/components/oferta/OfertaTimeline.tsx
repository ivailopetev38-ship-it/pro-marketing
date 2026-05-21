const PHASES = [
  {
    week: "Седмица 1",
    title: "Откриване",
    body: "Разговор за бранда, конкурентите, любимите ти референции. Преглеждаме съществуващите продукти, Instagram кампании, какво работи и какво искаш да промениш.",
    deliverable: "Творчески бриф",
  },
  {
    week: "Седмица 2",
    title: "Визия",
    body: "Мудборд + 3 различни дизайн посоки за hero страница. Избираш една — после я довеждаме до пълен дизайн на всички екрани във Figma.",
    deliverable: "Одобрена визия",
  },
  {
    week: "Седмица 3",
    title: "Развитие",
    body: "Кодираме сайта. Интегрираме плащания, доставка, Instagram. Качваме твоите първи 20 продукта като demo съдържание. Поверяваме ти достъп до staging версия.",
    deliverable: "Работещ staging",
  },
  {
    week: "Седмица 4",
    title: "Стартиране",
    body: "Тестваме всеки сценарий. Качваме на твоя домейн. Обучаваме те как сама да добавяш продукти. Стартираме съвместно с първа имейл кампания към твоята база.",
    deliverable: "Live · с първи поръчки",
  },
];

export function OfertaTimeline() {
  return (
    <section className="relative py-28 md:py-40">
      <div className="mx-auto max-w-5xl px-6 md:px-12">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.4em] text-[var(--color-accent-magenta)]">
          04 · Времеви хоризонт
        </p>

        <h2 className="font-[family-name:var(--font-editorial)] text-[clamp(36px,7vw,80px)] font-light leading-[1.05]">
          От подписа до{" "}
          <span className="italic">първата</span>
          <br />
          поръчка · 1 месец.
        </h2>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)] md:text-xl">
          Без забавяния. Без „ще се обадим следваща седмица". Точен график със седмични прегледи и ясни milestones.
        </p>

        <ol className="mt-20 space-y-12 md:space-y-0">
          {PHASES.map((p, i) => (
            <li
              key={p.week}
              className="relative grid grid-cols-1 gap-8 border-t border-[var(--color-border-default)] py-12 md:grid-cols-[180px_1fr_180px] md:items-start md:gap-12 md:py-16"
            >
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent-magenta)]">
                  {p.week}
                </p>
                <p className="mt-3 font-mono text-xs text-[var(--color-text-tertiary)]">
                  Фаза {String(i + 1).padStart(2, "0")}
                </p>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-editorial)] text-3xl font-medium text-[var(--color-text-primary)] md:text-4xl">
                  {p.title}
                </h3>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)] md:text-lg">
                  {p.body}
                </p>
              </div>
              <div className="md:text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-text-tertiary)]">
                  Резултат
                </p>
                <p
                  className="mt-2 font-[family-name:var(--font-editorial)] italic"
                  style={{ color: "var(--color-accent-cyan)" }}
                >
                  {p.deliverable}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
