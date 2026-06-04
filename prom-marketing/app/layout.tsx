import type { Metadata } from "next";
import { Unbounded, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { MetaPixel } from "@/components/effects/MetaPixel";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  display: "swap",
  variable: "--font-display",
  weight: ["500", "700", "800"],
});

const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "ProMarketing LTD — AI автоматизации за бизнеса",
  description:
    "Автоматизирай рутината с AI агенти. AI чат агенти, личен AI CRM и софтуер по поръчка — работят 24/7 и спестяват 12-15ч седмично.",
  metadataBase: new URL(
    (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim()) ||
      "https://promarketing.pw"
  ),
  keywords: [
    "AI автоматизация",
    "AI агенти България",
    "AI CRM",
    "чатбот за бизнес",
    "автоматизация на продажби",
    "AI асистент",
    "ProMarketing",
    "AI софтуер по поръчка",
  ],
  authors: [{ name: "Ивайло Петев", url: "https://promarketing.pw" }],
  creator: "ProMarketing LTD",
  publisher: "ProMarketing LTD",
  openGraph: {
    type: "website",
    locale: "bg_BG",
    url: "https://promarketing.pw",
    siteName: "ProMarketing LTD",
    title: "ProMarketing LTD — AI автоматизации за бизнеса",
    description:
      "AI чат агенти, личен AI CRM и софтуер по поръчка. Спестявай 12-15ч седмично. Запази безплатна консултация.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProMarketing LTD — AI автоматизации за бизнеса",
    description:
      "AI агенти работят 24/7, ти само одобряваш. Спестявай 12-15ч седмично.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://promarketing.pw",
    languages: { "bg-BG": "https://promarketing.pw" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="bg"
      className={`${unbounded.variable} ${interTight.variable} ${jetbrains.variable}`}
    >
      <body>
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[var(--color-accent-cyan)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--color-bg-void)] focus:outline-none"
        >
          Прескочи към съдържанието
        </a>
        <MetaPixel />
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
