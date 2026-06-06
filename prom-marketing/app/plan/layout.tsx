import type { Metadata } from "next";
import { Unbounded, Manrope, JetBrains_Mono } from "next/font/google";

const display = Unbounded({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--pl-display",
});
const body = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
  variable: "--pl-body",
});
const mono = JetBrains_Mono({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["500", "700"],
  display: "swap",
  variable: "--pl-mono",
});

export const metadata: Metadata = {
  title: "ProMarketing · Платформа + AI — план и цени",
  description:
    "Изграждане на бизнес платформа с изкуствен интелект — 3 фази, ясни цени и поддръжка.",
  robots: { index: false, follow: false },
};

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      style={
        {
          background: "#04060c",
          color: "#e8eef7",
          minHeight: "100vh",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
