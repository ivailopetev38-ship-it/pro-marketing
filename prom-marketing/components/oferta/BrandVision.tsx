const ELEMENTS = [
  {
    word: "Перли",
    body: "Дискретен лукс, който усещаш само ако се вгледаш по-внимателно.",
  },
  {
    word: "Дантели",
    body: "Ръчно изработени детайли, които никое масово производство не повтаря.",
  },
  {
    word: "Бродерия",
    body: "Името на клиента, инициали, история — превърнати в материя.",
  },
  {
    word: "Тъкан",
    body: "Памук, сатен, лен — избрани със същата грижа, с която ги предлагаш.",
  },
];

export function BrandVision() {
  return (
    <section className="relative border-y border-[var(--color-border-default)] bg-[var(--color-bg-deep)] py-28 md:py-40">
      <div className="mx-auto max-w-5xl px-6 md:px-12">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.4em] text-[var(--color-accent-magenta)]">
          01 · Видяхме брандa
        </p>

        <h2 className="font-[family-name:var(--font-editorial)] text-[clamp(36px,7vw,80px)] font-light leading-[1.05]">
          Това, което <span className="italic">правиш</span>,<br />
          не е спално бельо.
        </h2>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)] md:text-xl">
          Това е{" "}
          <span className="font-[family-name:var(--font-editorial)] italic text-[var(--color-text-primary)]">
            ритуал
          </span>
          . Подаръчна опаковка. Тих жест към себе си или към важен човек. Преглед на твоя Instagram го показва — всеки кадър е поставен внимателно, светлината е същата вечер след вечер, перлите се отразяват точно.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-[var(--color-border-default)] bg-[var(--color-border-default)] md:grid-cols-2">
          {ELEMENTS.map((el, i) => (
            <div
              key={el.word}
              className="bg-[var(--color-bg-void)] p-8 md:p-10"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-text-tertiary)]">
                0{i + 1}
              </p>
              <h3 className="mt-4 font-[family-name:var(--font-editorial)] text-3xl italic text-[var(--color-accent-magenta)] md:text-4xl">
                {el.word}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)] md:text-base">
                {el.body}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-16 max-w-2xl text-base italic text-[var(--color-text-secondary)] md:text-lg">
          {`Уебсайтът ти трябва да говори със същия език. Не "купи сега" — а "позволи си".`}
        </p>
      </div>
    </section>
  );
}
