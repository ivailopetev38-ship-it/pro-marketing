"use client";
import { AuroraBackground } from "@/components/effects/AuroraBackground";
import { ParticleField } from "@/components/effects/ParticleField";
import { TextScramble } from "@/components/effects/TextScramble";
import { HolographicText } from "@/components/effects/HolographicText";
import { MagneticButton } from "@/components/effects/MagneticButton";
import { HeroOrb } from "./HeroOrb";
import { openBookingPopup } from "@/lib/cal/embed";
import { track } from "@/lib/analytics/track";

export function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden">
      <AuroraBackground intensity="intense" />
      <ParticleField className="z-[1]" />
      <div className="absolute inset-0 z-[2] hidden lg:block">
        <div className="absolute right-[-10%] top-1/2 h-[80vh] w-[80vh] -translate-y-1/2 opacity-90">
          <HeroOrb />
        </div>
      </div>

      <div className="relative z-[3] mx-auto flex max-w-5xl flex-col items-start justify-center px-6 pt-44 pb-32 lg:min-h-[100svh] lg:pt-32">
        <span className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-[0.22em] text-[var(--color-accent-cyan)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-cyan)] shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          AI · Automation · Growth
        </span>

        <h1
          className="max-w-3xl font-display text-[clamp(30px,5vw,60px)] font-semibold leading-[1.08] tracking-tight [overflow-wrap:break-word] [hyphens:auto]"
          lang="bg"
        >
          <TextScramble text="Автоматизирай" />{" "}
          <HolographicText>бизнеса си</HolographicText>
          <br className="hidden sm:block" />
          <span className="font-light text-[var(--color-text-secondary)]">с AI агенти,</span>{" "}
          <span className="font-light text-[var(--color-text-secondary)]">които работят</span>{" "}
          <span className="text-[var(--color-accent-cyan)]">24/7</span>
          <span className="font-light text-[var(--color-text-secondary)]">.</span>
        </h1>

        <p className="mt-7 max-w-xl text-base text-[var(--color-text-secondary)] md:text-lg">
          AI чат агенти, личен{" "}
          <span className="font-medium text-[var(--color-text-primary)]">AI CRM</span>{" "}
          и{" "}
          <span className="font-medium text-[var(--color-text-primary)]">софтуер по поръчка</span>{" "}
          — поемат рутината и ти оставят само решенията, които носят растеж.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <MagneticButton>
            <button
              type="button"
              onClick={() => {
                track("cta_clicked", { location: "hero", target: "booking" });
                void openBookingPopup();
              }}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[var(--color-accent-cyan)] px-7 py-4 text-base font-semibold text-[var(--color-bg-void)] shadow-[0_0_40px_rgba(6,182,212,0.35)] transition-shadow hover:shadow-[0_0_60px_rgba(6,182,212,0.55)]"
            >
              <span>Запази безплатна консултация</span>
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </MagneticButton>
          <a
            href="#kontakti"
            onClick={() => track("cta_clicked", { location: "hero", target: "contact_form" })}
            className="group inline-flex items-center gap-2 rounded-full border-2 px-6 py-3.5 text-base font-semibold transition-all hover:scale-[1.03]"
            style={{
              borderColor: "var(--color-accent-cyan)",
              color: "var(--color-accent-cyan)",
              background: "rgba(0, 212, 255, 0.05)",
            }}
          >
            📞 Остави телефон
            <span aria-hidden className="transition-transform group-hover:translate-y-0.5">↓</span>
          </a>
          <a
            href="#services"
            className="inline-flex items-center gap-2 px-2 text-sm text-[var(--color-text-secondary)] underline-offset-4 hover:text-[var(--color-text-primary)] hover:underline"
          >
            Виж как работим ↓
          </a>
        </div>
      </div>

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-[4] h-32"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--color-bg-void))",
        }}
      />
    </section>
  );
}
