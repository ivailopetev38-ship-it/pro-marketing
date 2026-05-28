import { format } from "date-fns";
import { bg } from "date-fns/locale";

const today = format(new Date(), "d MMMM yyyy", { locale: bg });

const BUSINESS_FACTS = [
  { label: "Продукти", value: "15 000+", note: "Български и румънски" },
  { label: "Склада", value: "4", note: "София · Пловдив · Бургас · Варна" },
  { label: "Държави", value: "7+", note: "UK, IE, DE, BE, NL, AT…" },
  { label: "Темп. зони", value: "3", note: "Сух · Охладен 8° · Замразен -20°" },
];

const MODULES = [
  {
    n: "01",
    title: "Авто-публикуване в социалните мрежи · мулти-езично",
    body: "AI пише и публикува за нови продукти, сезонни оферти, новини — едновременно на български, английски, немски, румънски. Една публикация → 5+ профила.",
    bullets: [
      "Facebook + Instagram + TikTok + LinkedIn + Pinterest от едно място",
      "Авто-превод на пост за всеки пазар (диаспора в UK, DE, IE говорят на различни езици)",
      "Календар на публикации · седмично планиране",
      "AI genrira визии за нови продукти (опционално)",
      "Reels от продуктови снимки · готови за TikTok",
    ],
  },
  {
    n: "02",
    title: "Имейл център · order@tasteofbulgaria.net",
    body: "Един имейл, 6 различни типа писма. AI разпознава какво пристига и пуска правилния процес — без ръчно сортиране.",
    bullets: [
      "B2B поръчки от магазини в Европа → авто-проверка наличност → потвърждение",
      "Retail поръчки от диаспора → CRM запис + проследяване",
      "Заявки за франчайз → отделен workflow + обучителен пакет",
      "Имейли от доставчици → авто-категоризация + проследяване на стоки",
      "Рекламации → приоритет high + до 2 ч. отговор",
      "Често задавани въпроси → AI отговор веднага (доставка, цени, минимум)",
    ],
  },
  {
    n: "03",
    title: "Документи · фактури, сертификати, митница",
    body: "Експортна фирма не може без документи. Системата ги генерира, прибира в архив и ги намира за секунди.",
    bullets: [
      "Авто-генериране на фактури по поръчка (B2B, Retail, EU/UK с/без ДДС)",
      "Сертификати за храни · prikrepени към всяка поръчка (важно за европейски магазини)",
      "Митнически документи · CMR, опаковъчни листи, декларации",
      "Договори с франчайз партньори · с електронен подпис",
      "Архив по клиент, по дата, по продукт — търсене за 2 сек",
    ],
  },
  {
    n: "04",
    title: "Плащания · мулти-валута + сверяване",
    body: "BGN, EUR, GBP, RON в една система. AI сверява плащанията с поръчките автоматично — без таблици и проследяване ръчно.",
    bullets: [
      "Банкови преводи · авто-идентификация на клиента по основанието",
      "Картови плащания (e-commerce) · Stripe/Borica интеграция",
      "Наложен платеж · Speedy/Econt отчетност",
      "Международни преводи · Wise/SEPA проследяване",
      "Алерти при просрочени плащания от B2B клиенти",
    ],
  },
  {
    n: "05",
    title: "B2B портал · за магазините в Европа",
    body: "Всеки магазин в UK, Германия, Холандия получава собствен login. Поръчва сам, без да чака имейл-кореспонденция.",
    bullets: [
      "Login за всеки магазин · персонална ценова листа",
      "Самообслужване · слагат продукти в количка, поръчват",
      "Status tracking · виждат кога излиза палетата, кога пристига",
      "История на всички поръчки · повтори последна с 1 клик",
      "Тарифи 1 евро палет до 650 кг · авто-калкулатор",
    ],
  },
  {
    n: "06",
    title: "Склад · 4 локации · 15 000 продукта · 3 темп. зони",
    body: "Реално време какво къде има. Срокове на годност за храни. Алерти преди да свърши нещо. Без изненади.",
    bullets: [
      "Inventory в реално време · София / Пловдив / Бургас / Варна",
      "Срок на годност · алерти 30/14/7 дни преди изтичане",
      "Multi-temperature · сухо / охладено (8°C) / замразено (-20°C)",
      "Auto-realокация · ако в София няма, проверява Пловдив",
      "Седмични отчети · какви продукти излизат от склад",
    ],
  },
  {
    n: "07",
    title: "Франчайз модул · от заявка до отворен магазин",
    body: "Уникалното ви предложение — помагате на хора да отворят български магазин в чужбина. Системата ги води стъпка по стъпка.",
    bullets: [
      "Заявки за франчайз → AI оценка (бюджет, местоположение, опит)",
      "Onboarding workflow · 12-седмична програма",
      "Обучителни материали · автоматично се изпращат при етап",
      "Performance tracking · колко продава всеки франчайз партньор",
      "Мрежа от франчайзи · виждаш всички на карта",
    ],
  },
  {
    n: "08",
    title: "AI customer support · 24/7 · мулти-езичен",
    body: "Диаспората пита на български, английски, немски. AI разпознава езика и отговаря на същия. За често задавани — мигновено.",
    bullets: [
      "Български · английски · немски · румънски",
      "Разпознава езика автоматично",
      "Често задавани · доставка, минимум, цени, плащане",
      "Сложни въпроси · ескалира до теб с готов отговор",
      "WhatsApp + Viber + Messenger + сайт чат — едно място",
    ],
  },
  {
    n: "09",
    title: "Анализи · какво се продава къде, кога",
    body: "Експортна компания без данни е като магазин със затворени очи. AI ти показва какво расте, какво пада, защо.",
    bullets: [
      "Топ продукти по държава (UK харесва X, DE харесва Y)",
      "Сезонност · Великден, Коледа, Гергьовден за диаспора",
      "Прогноза за поръчки · колко стока да докараш в склада",
      "Анализ на франчайзи · кой расте, кой се нуждае от помощ",
      "Седмичен отчет · в имейла ти всеки понеделник 8:00",
    ],
  },
];

const PROCESS = [
  { step: "1", title: "Анализ + аудит", body: "Преглеждаме текущите процеси, имейли, документи, складова система. 3-5 работни дни." },
  { step: "2", title: "План + дизайн", body: "Конкретен план за всеки модул, mockups, ясни срокове. Подписваме договор." },
  { step: "3", title: "Изграждане Phase 1", body: "30-45 дни до стартиране на основните модули (имейл център, документи, B2B портал, склад)." },
  { step: "4", title: "Тренинг + старт", body: "Идваме в Пловдив за 2-3 дни. Обучаваме екипа. Стартираме на живо." },
  { step: "5", title: "Поддръжка + надграждане", body: "30 дни безплатна поддръжка. После Phase 2 (анализи, франчайз модул, мулти-езично)." },
];

const WHY = [
  { title: "Аналогична работа имам", body: "Изграждам AI системи за български експортни и e-commerce фирми. Не сме теоретици — виждаме реалните проблеми." },
  { title: "Локални сме", body: "От Пловдив сме. Идваме на място, не само Zoom. Лична връзка с екипа ти." },
  { title: "Твоя система, твой Cloud", body: "Всичко е на твоя сървър. Никога няма да зависиш от платформа, която утре фалира или вдига цените." },
  { title: "Расте с теб", body: "Базов пакет днес, разширение утре. Не плащаш за функции, които не ползваш още." },
];

const TIERS = [
  {
    name: "Phase 1 · Базов",
    price: "3 000 €",
    suffix: "еднократно · без ДДС",
    badge: "Препоръчвам",
    highlight: true,
    features: [
      "Имейл център с AI разпознаване (модул 02)",
      "Документи · фактури + сертификати (модул 03)",
      "Плащания · сверяване BGN/EUR/GBP (модул 04)",
      "B2B портал за магазините в Европа (модул 05)",
      "Склад · 4 локации + срок на годност (модул 06)",
      "Базова интеграция с уебсайта",
      "30-45 дни срок",
      "30 дни безплатна поддръжка",
    ],
  },
  {
    name: "Phase 1+2 · Разширен",
    price: "4 500 €",
    suffix: "еднократно · без ДДС",
    features: [
      "Всичко от Phase 1",
      "Авто-публикуване в социалните мрежи (модул 01)",
      "AI customer support мулти-езичен (модул 08)",
      "Анализи · топ продукти по държава (модул 09)",
      "60-75 дни срок",
    ],
  },
  {
    name: "Phase 1+2+3 · Пълно решение",
    price: "6 000 €",
    suffix: "еднократно · без ДДС",
    features: [
      "Всичко от Phase 1 + Phase 2",
      "Франчайз модул цялостен (модул 07)",
      "AI генериране на визии за нови продукти",
      "Reels авто-генериране от продуктови снимки",
      "Прогнозни анализи за склад",
      "90-120 дни срок",
    ],
  },
];

const RECURRING = "Месечна поддръжка след стартиране: 400 – 600 € без ДДС на месец (хостинг, AI API кредити, технически промени, реакция в рамките на 24 ч).";

export default function TasteOfBulgariaPage() {
  return (
    <main className="font-[family-name:var(--font-body)] text-[var(--color-text-primary)]">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(249, 115, 22, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 1) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 18% 25%, rgba(249, 115, 22, 0.20) 0%, transparent 50%), radial-gradient(ellipse at 82% 75%, rgba(250, 204, 21, 0.12) 0%, transparent 45%)",
          }}
        />

        <div className="relative mx-auto flex min-h-[92vh] max-w-5xl flex-col justify-center px-6 py-32 md:px-12">
          <p className="mb-8 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.4em] text-[var(--color-orange-bright)]">
            ПРЕЗЕНТАЦИЯ · {today}
          </p>

          <p className="mb-3 font-[family-name:var(--font-editorial)] text-2xl text-[var(--color-text-secondary)]">
            за
          </p>

          <h1 className="font-[family-name:var(--font-editorial)] text-[clamp(36px,6vw,72px)] font-extrabold leading-[1.05] tracking-tight">
            <span style={{ color: "var(--color-text-primary)" }}>Taste of </span>
            <span
              style={{
                color: "transparent",
                backgroundImage: "linear-gradient(135deg, #fde047, #f97316 50%, #dc2626)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
              }}
            >
              Bulgaria
            </span>
          </h1>

          <p className="mt-6 inline-block w-fit rounded-full border border-[var(--color-border-bright)] bg-[rgba(249,115,22,0.10)] px-4 py-1.5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.3em] text-[var(--color-orange-bright)]">
            🥖 Български храни · Експорт · 4 склада · 7+ държави
          </p>

          <div className="mt-12 max-w-2xl">
            <p className="text-lg leading-relaxed text-[var(--color-text-secondary)] md:text-xl">
              AI операционна система за{" "}
              <span className="font-[family-name:var(--font-editorial)] font-bold text-[var(--color-text-primary)]">
                най-големия онлайн склад за български стоки
              </span>{" "}
              — автоматично разпределение на имейли, мулти-валутни плащания, B2B портал за магазините ти в Европа, склад с 15 000+ продукта в реално време.
            </p>
          </div>

          <div className="mt-14 flex items-center gap-6">
            <div aria-hidden className="h-px w-12" style={{ background: "var(--color-orange-bright)" }} />
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.3em] text-[var(--color-text-tertiary)]">
              За Георги Тошев · „ПроМаркетинг" ЕООД
            </p>
          </div>

          <div className="mt-20 flex flex-wrap gap-4">
            <a
              href="#design"
              className="inline-flex items-center gap-2 rounded-full border-2 px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] transition-colors"
              style={{
                borderColor: "var(--color-orange-bright)",
                color: "var(--color-orange-bright)",
                background: "rgba(249, 115, 22, 0.10)",
              }}
            >
              🎨 Виж визуализацията
              <span aria-hidden>↓</span>
            </a>
            <a
              href="#price"
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm uppercase tracking-[0.15em] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-orange-bright)] hover:text-[var(--color-orange-bright)]"
              style={{ borderColor: "var(--color-border-default)" }}
            >
              💎 Цена · от 3 000 €
            </a>
            <a
              href="#modules"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-orange-bright)]"
            >
              9 модула
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* BUSINESS FACTS — proof we researched */}
      <section
        className="relative border-t border-[var(--color-border-default)] py-20"
        style={{ background: "rgba(249, 115, 22, 0.03)" }}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.4em] text-[var(--color-orange-bright)]">
            Анализ на бизнеса
          </p>
          <h2 className="mb-10 max-w-3xl font-[family-name:var(--font-editorial)] text-[clamp(28px,4vw,48px)] font-extrabold leading-[1.08]">
            Това което знаем за <span className="text-[var(--color-orange-bright)]">бизнеса ти</span>.
          </h2>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {BUSINESS_FACTS.map((f) => (
              <div
                key={f.label}
                className="rounded-2xl border p-5"
                style={{
                  borderColor: "var(--color-border-default)",
                  background: "rgba(26, 10, 5, 0.6)",
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-tertiary)]">
                  {f.label}
                </p>
                <p className="mt-1 font-[family-name:var(--font-editorial)] text-4xl font-extrabold text-[var(--color-orange-bright)]">
                  {f.value}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{f.note}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 max-w-3xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Експортна фирма с този мащаб — 15 000 продукта, 4 склада, 3 температурни зони, износ към 7+ европейски държави, плюс франчайз мрежа — не може да работи с Excel и ръчни имейли. AI системата по-долу адресира всеки един от тези процеси.
          </p>
        </div>
      </section>

      {/* MODULES */}
      <section id="modules" className="relative border-t border-[var(--color-border-default)] py-32">
        <div className="mx-auto max-w-5xl px-6 md:px-12">
          <p className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.4em] text-[var(--color-orange-bright)]">
            Какво ще изградим
          </p>
          <h2 className="mb-4 max-w-3xl font-[family-name:var(--font-editorial)] text-[clamp(32px,5vw,56px)] font-extrabold leading-[1.05]">
            9 модула. Един общ <span className="text-[var(--color-orange-bright)]">мозък</span>.
          </h2>
          <p className="mb-16 max-w-3xl text-base leading-relaxed text-[var(--color-text-secondary)]">
            Всеки модул решава конкретен процес. Заедно — пълна операционна система за експортна фирма.
          </p>

          <div className="space-y-6">
            {MODULES.map((m) => (
              <div
                key={m.n}
                className="rounded-2xl border p-7"
                style={{
                  borderColor: "var(--color-border-default)",
                  background: "rgba(42, 18, 8, 0.50)",
                }}
              >
                <div className="mb-4 flex flex-wrap items-baseline gap-4">
                  <span className="rounded-full border border-[var(--color-orange-bright)] bg-[rgba(249,115,22,0.10)] px-3 py-1 font-mono text-[11px] font-bold text-[var(--color-orange-bright)]">
                    {m.n}
                  </span>
                  <h3 className="font-[family-name:var(--font-editorial)] text-xl font-bold leading-tight md:text-2xl">
                    {m.title}
                  </h3>
                </div>
                <p className="mb-5 text-base leading-relaxed text-[var(--color-text-secondary)]">{m.body}</p>
                <ul className="space-y-2">
                  {m.bullets.map((b, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-text-primary)]"
                    >
                      <span className="mt-1 text-[var(--color-orange-bright)]">▸</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISUAL MOCKUPS */}
      <section
        id="design"
        className="relative border-t border-[var(--color-border-default)] py-32"
        style={{ background: "rgba(249, 115, 22, 0.03)" }}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <p className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.4em] text-[var(--color-orange-bright)]">
            Как ще изглежда системата
          </p>
          <h2 className="mb-4 max-w-3xl font-[family-name:var(--font-editorial)] text-[clamp(32px,5vw,56px)] font-extrabold leading-[1.05]">
            Реални <span className="text-[var(--color-orange-bright)]">екрани</span>.
          </h2>
          <p className="mb-16 max-w-3xl text-base leading-relaxed text-[var(--color-text-secondary)]">
            Не обещания на хартия — това са реалните изгледи, които твоят екип ще използва всеки ден.
          </p>

          {/* MOCKUP 1: Email Center */}
          <div className="mb-20">
            <div className="mb-5 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-orange-bright)]">
                Изглед 01
              </span>
              <h3 className="font-[family-name:var(--font-editorial)] text-2xl font-bold">
                Имейл център · AI разпознаване
              </h3>
            </div>
            <div
              className="rounded-2xl border-2 p-6 shadow-2xl"
              style={{
                borderColor: "var(--color-border-bright)",
                background: "linear-gradient(135deg, rgba(42, 18, 8, 0.85), rgba(26, 10, 5, 0.95))",
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
                  <span className="h-3 w-3 rounded-full bg-[#facc15]" />
                  <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
                  <span className="ml-4 font-mono text-xs text-white/60">📧 order@tasteofbulgaria.net</span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#22c55e]">● 47 нови днес</span>
              </div>

              <div className="space-y-2">
                {[
                  { type: "B2B", from: "BulgarianFood Hamburg GmbH", subject: "Поръчка 23 палети до петък", color: "#f97316", priority: "HIGH" },
                  { type: "Retail", from: "Ивана Петкова · IE", subject: "Може ли да добавя кашкавал?", color: "#22c55e", priority: "MED" },
                  { type: "Франчайз", from: "Стефан · Виена", subject: "Интерес към отваряне магазин", color: "#a78bfa", priority: "HIGH" },
                  { type: "Доставчик", from: "Маджаров Млечни", subject: "Нов сертификат BSE-203", color: "#06b6d4", priority: "LOW" },
                  { type: "Рекламация", from: "Bulgarian Shop London", subject: "Развалени баници в палета #4421", color: "#ef4444", priority: "URGENT" },
                ].map((e, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/20 px-4 py-3"
                  >
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
                      style={{ background: e.color + "22", color: e.color }}
                    >
                      {e.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-bold text-white">{e.from}</p>
                      <p className="truncate text-xs text-white/60">{e.subject}</p>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
                      style={{
                        background:
                          e.priority === "URGENT"
                            ? "#ef4444"
                            : e.priority === "HIGH"
                            ? "#f97316"
                            : e.priority === "MED"
                            ? "#facc15"
                            : "#64748b",
                        color: "white",
                      }}
                    >
                      {e.priority}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-lg border border-[var(--color-orange-bright)]/30 bg-[rgba(249,115,22,0.06)] p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-orange-bright)]">
                  🤖 AI асистент
                </p>
                <p className="mt-2 text-xs leading-relaxed text-white/80">
                  „Рекламацията за палета #4421 е приоритет 1. Изпратих стандартен отговор + започнах разследване на температурата при транспорт. Trigger-нах застраховка процедура."
                </p>
              </div>
            </div>
          </div>

          {/* MOCKUP 2: Warehouse Dashboard */}
          <div className="mb-20">
            <div className="mb-5 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-orange-bright)]">
                Изглед 02
              </span>
              <h3 className="font-[family-name:var(--font-editorial)] text-2xl font-bold">
                Склад · 4 локации в реално време
              </h3>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <div
                className="rounded-2xl border-2 p-6"
                style={{
                  borderColor: "var(--color-border-bright)",
                  background: "rgba(42, 18, 8, 0.85)",
                }}
              >
                <h4 className="mb-4 font-display text-base font-bold text-white">Локации</h4>
                {[
                  { city: "София", products: 8240, status: "OK", fill: 78, alerts: 3 },
                  { city: "Пловдив", products: 5120, status: "OK", fill: 62, alerts: 1 },
                  { city: "Бургас", products: 1850, status: "LOW", fill: 28, alerts: 12 },
                  { city: "Варна", products: 2470, status: "OK", fill: 55, alerts: 0 },
                ].map((w, i) => (
                  <div key={i} className="mb-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-bold text-white">📦 {w.city}</span>
                      <span className="text-white/60">
                        {w.products.toLocaleString("bg-BG")} продукта
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${w.fill}%`,
                          background:
                            w.status === "LOW"
                              ? "linear-gradient(90deg, #ef4444, #f97316)"
                              : "linear-gradient(90deg, #f97316, #facc15)",
                        }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-white/50">
                      <span>{w.fill}% заето</span>
                      {w.alerts > 0 && (
                        <span className="text-[#ef4444]">⚠️ {w.alerts} низък stock</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="rounded-2xl border-2 p-6"
                style={{
                  borderColor: "var(--color-border-bright)",
                  background: "rgba(42, 18, 8, 0.85)",
                }}
              >
                <h4 className="mb-4 font-display text-base font-bold text-white">⚠️ Срокове на годност</h4>
                <div className="space-y-3">
                  {[
                    { product: "Сирене краве 1кг · Маджаров", expires: "след 12 дни", stock: 124, urgent: true },
                    { product: "Кисело мляко 400г · Сладов", expires: "след 18 дни", stock: 89, urgent: false },
                    { product: "Луканка Орехите · Орлов", expires: "след 25 дни", stock: 56, urgent: false },
                    { product: "Замразени баници · Сватба", expires: "след 4 дни", stock: 32, urgent: true },
                  ].map((p, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-white/5 bg-black/20 p-3"
                      style={{
                        borderColor: p.urgent ? "rgba(239, 68, 68, 0.4)" : "rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      <p className="text-xs font-bold text-white">{p.product}</p>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className={p.urgent ? "text-[#ef4444]" : "text-white/60"}>
                          {p.urgent && "🔥 "}Изтича {p.expires}
                        </span>
                        <span className="font-mono text-white/70">{p.stock} бр</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full rounded-lg bg-[var(--color-orange)] py-2 text-xs font-bold text-white">
                  Активирай намаление за изтичащи →
                </button>
              </div>
            </div>
          </div>

          {/* MOCKUP 3: B2B Portal */}
          <div className="mb-20">
            <div className="mb-5 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-orange-bright)]">
                Изглед 03
              </span>
              <h3 className="font-[family-name:var(--font-editorial)] text-2xl font-bold">
                B2B портал · магазин в UK поръчва сам
              </h3>
            </div>
            <div
              className="rounded-2xl border-2 p-6"
              style={{
                borderColor: "var(--color-border-bright)",
                background: "rgba(42, 18, 8, 0.85)",
              }}
            >
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-white/50">Login като</p>
                  <p className="font-bold text-white">🏪 Bulgarian Shop London Ltd · UK</p>
                </div>
                <span className="rounded-full bg-[#22c55e]/20 px-3 py-1 text-[10px] font-bold uppercase text-[#22c55e]">
                  ● онлайн
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-black/30 p-4">
                  <p className="font-mono text-[10px] uppercase text-white/50">Тази поръчка</p>
                  <p className="mt-1 font-display text-2xl font-bold text-[var(--color-orange-bright)]">
                    14 палети
                  </p>
                  <p className="text-[10px] text-white/60">~ 9 100 кг</p>
                </div>
                <div className="rounded-lg bg-black/30 p-4">
                  <p className="font-mono text-[10px] uppercase text-white/50">Сума</p>
                  <p className="mt-1 font-display text-2xl font-bold text-[var(--color-gold)]">
                    £14 280
                  </p>
                  <p className="text-[10px] text-white/60">Без VAT · ваша цена</p>
                </div>
                <div className="rounded-lg bg-black/30 p-4">
                  <p className="font-mono text-[10px] uppercase text-white/50">Доставка</p>
                  <p className="mt-1 font-display text-2xl font-bold text-white">7 дни</p>
                  <p className="text-[10px] text-white/60">Сухо + охладено</p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <p className="font-mono text-[10px] uppercase text-white/50">Статус на поръчката</p>
                {[
                  { step: "Поръчка приета", done: true },
                  { step: "Опаковане в София", done: true },
                  { step: "Митнически документи", done: true },
                  { step: "Транспорт към UK", done: false, active: true },
                  { step: "Доставка в магазина", done: false },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px]"
                      style={{
                        background: s.done ? "#22c55e" : s.active ? "#f97316" : "rgba(255,255,255,0.1)",
                        color: s.done || s.active ? "white" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {s.done ? "✓" : i + 1}
                    </span>
                    <span
                      className="text-xs"
                      style={{
                        color: s.done ? "white" : s.active ? "var(--color-orange-bright)" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {s.step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MOCKUP 4: Sales Analytics */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-orange-bright)]">
                Изглед 04
              </span>
              <h3 className="font-[family-name:var(--font-editorial)] text-2xl font-bold">
                Анализи · какво се продава къде
              </h3>
            </div>
            <div
              className="rounded-2xl border-2 p-6"
              style={{
                borderColor: "var(--color-border-bright)",
                background: "rgba(42, 18, 8, 0.85)",
              }}
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-4 font-display text-sm font-bold text-white">Топ 5 продукта по държава</h4>
                  <div className="space-y-3">
                    {[
                      { country: "🇬🇧 UK", top: "Кашкавал Витоша", change: "+34%" },
                      { country: "🇩🇪 Германия", top: "Луканка Орлов", change: "+18%" },
                      { country: "🇮🇪 Ирландия", top: "Замразени баници", change: "+52%" },
                      { country: "🇧🇪 Белгия", top: "Кисело мляко", change: "+12%" },
                      { country: "🇳🇱 Холандия", top: "Сирене краве", change: "+27%" },
                    ].map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-3 py-2"
                      >
                        <div>
                          <p className="text-xs text-white">{c.country}</p>
                          <p className="text-[11px] text-white/60">{c.top}</p>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-[#22c55e]">
                          {c.change}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-4 font-display text-sm font-bold text-white">Сезонност · диаспора</h4>
                  <div className="rounded-lg border border-white/5 bg-black/20 p-4">
                    <p className="mb-3 font-mono text-[10px] uppercase text-white/50">Очаквана продажба</p>
                    <div className="space-y-2">
                      {[
                        { event: "🐣 Великден", peak: "Боза, козунаци, червени яйца", boost: "× 4.2" },
                        { event: "🎄 Коледа", peak: "Сарми, пилаф, кратуни", boost: "× 5.8" },
                        { event: "🍷 Гергьовден", peak: "Агнешко, чубрица", boost: "× 2.6" },
                      ].map((s, i) => (
                        <div key={i} className="rounded border border-white/5 bg-black/30 p-2">
                          <p className="text-[11px] text-white">{s.event}</p>
                          <p className="text-[10px] text-white/60">{s.peak}</p>
                          <p className="text-[10px] font-mono text-[var(--color-gold)]">{s.boost} спрямо обичайно</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICE */}
      <section id="price" className="relative border-t border-[var(--color-border-default)] py-32">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <p className="mb-4 text-center font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.4em] text-[var(--color-orange-bright)]">
            Инвестиция
          </p>
          <h2 className="mb-16 text-center font-[family-name:var(--font-editorial)] text-[clamp(32px,5vw,56px)] font-extrabold leading-[1.05]">
            Три нива · избираш по нужда.
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className="relative flex flex-col rounded-3xl border-2 p-7"
                style={{
                  borderColor: t.highlight ? "var(--color-orange-bright)" : "var(--color-border-default)",
                  background: t.highlight
                    ? "linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(250, 204, 21, 0.06))"
                    : "rgba(42, 18, 8, 0.50)",
                }}
              >
                {t.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-orange)] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                    {t.badge}
                  </span>
                )}
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-orange-bright)]">
                  {t.name}
                </p>
                <p className="mt-3 font-[family-name:var(--font-editorial)] text-4xl font-extrabold text-[var(--color-text-primary)]">
                  {t.price}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  {t.suffix}
                </p>
                <ul className="mt-6 flex-1 space-y-2">
                  {t.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-text-primary)]"
                    >
                      <span className="mt-1 text-[var(--color-orange-bright)]">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="mx-auto mt-10 max-w-3xl rounded-2xl border p-6 text-center"
            style={{
              borderColor: "var(--color-border-bright)",
              background: "rgba(250, 204, 21, 0.05)",
            }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)]">
              Месечна поддръжка
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-primary)]">
              {RECURRING}
            </p>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section
        className="relative border-t border-[var(--color-border-default)] py-32"
        style={{ background: "rgba(249, 115, 22, 0.03)" }}
      >
        <div className="mx-auto max-w-5xl px-6 md:px-12">
          <p className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.4em] text-[var(--color-orange-bright)]">
            Процес
          </p>
          <h2 className="mb-16 max-w-3xl font-[family-name:var(--font-editorial)] text-[clamp(32px,5vw,56px)] font-extrabold leading-[1.05]">
            От подпис до <span className="text-[var(--color-orange-bright)]">стартиране</span>.
          </h2>
          <div className="space-y-4">
            {PROCESS.map((p) => (
              <div
                key={p.step}
                className="flex items-start gap-5 rounded-2xl border p-6"
                style={{
                  borderColor: "var(--color-border-default)",
                  background: "rgba(42, 18, 8, 0.50)",
                }}
              >
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-orange)] font-display text-lg font-bold text-white">
                  {p.step}
                </span>
                <div>
                  <h3 className="font-[family-name:var(--font-editorial)] text-xl font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="relative border-t border-[var(--color-border-default)] py-32">
        <div className="mx-auto max-w-5xl px-6 md:px-12">
          <p className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.4em] text-[var(--color-orange-bright)]">
            Защо ние
          </p>
          <h2 className="mb-16 max-w-3xl font-[family-name:var(--font-editorial)] text-[clamp(32px,5vw,56px)] font-extrabold leading-[1.05]">
            Защо <span className="text-[var(--color-orange-bright)]">ProMarketing</span>.
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {WHY.map((w) => (
              <div
                key={w.title}
                className="rounded-2xl border p-6"
                style={{
                  borderColor: "var(--color-border-default)",
                  background: "rgba(42, 18, 8, 0.50)",
                }}
              >
                <h3 className="mb-3 font-[family-name:var(--font-editorial)] text-xl font-bold">{w.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section
        className="relative border-t border-[var(--color-border-default)] py-32"
        style={{
          background:
            "linear-gradient(135deg, rgba(249, 115, 22, 0.10), rgba(26, 10, 5, 0.20))",
        }}
      >
        <div className="mx-auto max-w-4xl px-6 text-center md:px-12">
          <p className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.4em] text-[var(--color-orange-bright)]">
            Следваща стъпка
          </p>
          <h2 className="mb-8 font-[family-name:var(--font-editorial)] text-[clamp(32px,5vw,56px)] font-extrabold leading-[1.05]">
            Готов да автоматизираш <br />
            <span className="text-[var(--color-orange-bright)]">експорта си</span>?
          </h2>
          <p className="mb-12 mx-auto max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)]">
            Кажи „да" по имейл или телефон. Идвам в Пловдив за 1-2 дни — преглеждаме процесите, уточняваме обхват, подписваме договор.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:ivailopetev38@gmail.com?subject=Taste of Bulgaria · Старт"
              className="inline-flex items-center gap-2 rounded-full border-2 px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] transition-colors"
              style={{
                borderColor: "var(--color-orange-bright)",
                color: "var(--color-bg-void)",
                background: "var(--color-orange-bright)",
              }}
            >
              ✉️ Отговори с „Започваме"
            </a>
            <a
              href="tel:+359877399963"
              className="inline-flex items-center gap-2 rounded-full border px-8 py-4 text-sm uppercase tracking-[0.15em] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-orange-bright)] hover:text-[var(--color-orange-bright)]"
              style={{ borderColor: "var(--color-border-default)" }}
            >
              📞 +359 877 399 963
            </a>
          </div>

          <p className="mt-16 font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--color-text-tertiary)]">
            Ивайло Петев · ProMarketing ЕООД · Пловдив, България
          </p>
        </div>
      </section>
    </main>
  );
}
