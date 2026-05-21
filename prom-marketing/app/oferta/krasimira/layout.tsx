import { Cormorant_Garamond } from "next/font/google";
import type { Metadata } from "next";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  display: "swap",
  variable: "--font-editorial",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "За Красимира · Уебсайт за Boutique Bedding",
  description:
    "Персонализирана оферта за уебсайт от ProMarketing LTD — за луксозно спално бельо с перли, дантели и бродерия.",
  robots: { index: false, follow: false },
};

export default function OfertaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${cormorant.variable} oferta-theme min-h-screen`}
      style={
        {
          // Boutique luxury palette — completely overrides the dark brand theme
          // so this page reads as a personalised proposal, not a marketing pitch.
          "--color-bg-void": "#fbf7f0",
          "--color-bg-deep": "#f3ebde",
          "--color-bg-glass": "rgba(255, 252, 246, 0.7)",
          "--color-accent-cyan": "#b89968",
          "--color-accent-violet": "#c8a4a4",
          "--color-accent-magenta": "#8b7355",
          "--color-text-primary": "#2a2520",
          "--color-text-secondary": "#5a4f44",
          "--color-text-tertiary": "#9a8e7e",
          "--color-border-default": "rgba(184, 153, 104, 0.22)",
          "--color-border-bright": "rgba(184, 153, 104, 0.55)",
          background: "#fbf7f0",
          color: "#2a2520",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
