import { format } from "date-fns";
import { bg } from "date-fns/locale";

const today = format(new Date(), "d MMMM yyyy", { locale: bg });

export function OfertaHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft pearl glow background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(232, 207, 175, 0.45) 0%, transparent 55%), radial-gradient(ellipse at 75% 85%, rgba(200, 164, 164, 0.30) 0%, transparent 50%)",
        }}
      />
      {/* Subtle lace pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #8b7355 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto flex min-h-[92vh] max-w-5xl flex-col justify-center px-6 py-32 md:px-12">
        <p className="mb-8 font-mono text-xs uppercase tracking-[0.4em] text-[var(--color-accent-magenta)]">
          ПРЕДЛОЖЕНИЕ · {today}
        </p>

        <p className="mb-3 font-[family-name:var(--font-editorial)] text-2xl italic text-[var(--color-text-secondary)] md:text-3xl">
          за
        </p>

        <h1 className="font-[family-name:var(--font-editorial)] text-[clamp(56px,11vw,160px)] font-light leading-[0.95] tracking-tight">
          <span className="italic">Красимира</span>
          <br />
          <span className="text-[var(--color-accent-magenta)]">Йотова</span>
        </h1>

        <div className="mt-12 max-w-2xl">
          <p className="text-lg leading-relaxed text-[var(--color-text-secondary)] md:text-xl">
            Уебсайт за{" "}
            <span className="font-[family-name:var(--font-editorial)] italic text-[var(--color-text-primary)]">
              Boutique Bedding
            </span>{" "}
            — луксозно спално бельо с перли, дантели и персонализирана бродерия. Място, което усеща материята, преди да я докоснеш.
          </p>
        </div>

        <div className="mt-14 flex items-center gap-6">
          <div
            aria-hidden
            className="h-px w-12"
            style={{ background: "var(--color-accent-cyan)" }}
          />
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-text-tertiary)]">
            ProMarketing LTD · персонална оферта
          </p>
        </div>

        <a
          href="#scope"
          className="mt-20 inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-accent-cyan)]"
        >
          Прочети офертата
          <span aria-hidden>↓</span>
        </a>
      </div>
    </section>
  );
}
