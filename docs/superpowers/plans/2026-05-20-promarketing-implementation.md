# ProMarketing LTD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a futuristic Bulgarian-language marketing website for ProMarketing LTD with Cal.com-embedded booking and a Supabase-backed admin dashboard.

**Architecture:** Next.js 15 App Router monorepo. Public landing is mostly Server Components composing "use client" effect wrappers. Cal.com handles all lead capture via embed popup; bookings mirror into Supabase through an HMAC-verified webhook. Admin pages are gated by Supabase Auth + an email allow-list, with RLS-protected reads.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, TailwindCSS 4, shadcn/ui, Supabase (PostgreSQL + Auth + RLS), Cal.com (embed + webhook), Motion (Framer Motion v11+), Three.js, Vitest, Playwright, Vercel.

---

## Conventions

- Working directory: `C:\Users\User\Documents\Бизнес\prom-marketing` (created in Task 1).
- All commits use Conventional Commit prefixes (`feat:`, `fix:`, `chore:`, `test:`, `docs:`, `style:`).
- Every code step includes complete file contents — do not leave anything as "fill in".
- After every task, run the listed verification command and confirm expected output before committing.
- The Node binary lives at `C:\Program Files\nodejs\`. PowerShell's execution policy blocks `npm.ps1`; use `npm.cmd` (or run via Bash where `/c/Program Files/nodejs` is on PATH).
- Tailwind 4 uses `@import "tailwindcss"` in CSS (not v3 directives).
- All landing page copy is **Bulgarian only**.

---

## Phase 1 — Foundation

### Task 1: Scaffold Next.js project

**Files:**
- Create: `prom-marketing/` (subdirectory of working dir)

- [ ] **Step 1: Create the project**

Run from `C:\Users\User\Documents\Бизнес`:

```bash
export PATH="/c/Program Files/nodejs:$PATH"
npx --yes create-next-app@latest prom-marketing \
  --typescript --tailwind --eslint --app \
  --no-src-dir --import-alias "@/*" --turbopack
```

Expected: project created, npm install completes.

- [ ] **Step 2: Verify dev server**

```bash
cd prom-marketing
npm run dev
```

Expected: server starts at http://localhost:3000, default Next.js page renders. Stop with Ctrl+C.

- [ ] **Step 3: Commit scaffolded project**

```bash
git add prom-marketing
git commit -m "feat: scaffold Next.js project with TS, Tailwind, App Router"
```

---

### Task 2: Install runtime dependencies

**Files:**
- Modify: `prom-marketing/package.json`

- [ ] **Step 1: Install runtime packages**

```bash
cd prom-marketing
npm install \
  @supabase/ssr @supabase/supabase-js \
  @calcom/embed-react \
  motion \
  three @react-three/fiber @react-three/drei \
  lucide-react \
  zod \
  date-fns \
  canvas-confetti \
  clsx tailwind-merge \
  class-variance-authority \
  @radix-ui/react-slot \
  @radix-ui/react-accordion \
  @radix-ui/react-dialog \
  @tanstack/react-table \
  sonner
```

- [ ] **Step 2: Install dev packages**

```bash
npm install -D \
  vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom \
  @playwright/test \
  @types/three @types/canvas-confetti \
  tsx \
  prettier prettier-plugin-tailwindcss
```

- [ ] **Step 3: Verify install**

```bash
npm ls --depth=0 2>&1 | head -50
```

Expected: no `UNMET DEPENDENCY` errors.

- [ ] **Step 4: Commit lockfile**

```bash
git add package.json package-lock.json
git commit -m "feat: add runtime and dev dependencies"
```

---

### Task 3: Configure design tokens and globals.css

**Files:**
- Replace: `prom-marketing/app/globals.css`

- [ ] **Step 1: Replace globals.css**

```css
@import "tailwindcss";

@theme {
  --color-bg-void: #030308;
  --color-bg-deep: #0a0a1f;
  --color-bg-glass: rgba(255, 255, 255, 0.03);

  --color-accent-cyan: #06b6d4;
  --color-accent-violet: #7c3aed;
  --color-accent-magenta: #ec4899;

  --color-text-primary: #f5f7ff;
  --color-text-secondary: #a0a8c0;
  --color-text-tertiary: #4a5070;

  --color-border-default: rgba(124, 58, 237, 0.15);
  --color-border-bright: rgba(6, 182, 212, 0.4);

  --font-display: "Syne", system-ui, sans-serif;
  --font-body: "Inter Tight", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}

@layer base {
  :root {
    color-scheme: dark;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    background: var(--color-bg-void);
    color: var(--color-text-primary);
    font-family: var(--font-body);
    font-feature-settings: "ss01", "cv11";
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  h1, h2, h3, h4 {
    font-family: var(--font-display);
    letter-spacing: -0.02em;
  }

  ::selection {
    background: var(--color-accent-cyan);
    color: var(--color-bg-void);
  }

  /* Hide default cursor when our custom one is active */
  body.custom-cursor-active,
  body.custom-cursor-active * {
    cursor: none !important;
  }
}

@layer utilities {
  .glass {
    background: var(--color-bg-glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--color-border-default);
  }

  .grid-overlay {
    background-image:
      linear-gradient(rgba(124, 58, 237, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124, 58, 237, 0.06) 1px, transparent 1px);
    background-size: 80px 80px;
  }

  .text-holographic {
    background: linear-gradient(135deg, #ffffff 0%, #7dd3fc 40%, #c4b5fd 70%, #ffffff 100%);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: hologram 6s ease-in-out infinite;
  }

  .glow-cyan {
    box-shadow: 0 0 40px rgba(6, 182, 212, 0.15);
  }

  .glow-cyan-strong {
    box-shadow:
      inset 0 0 30px rgba(6, 182, 212, 0.1),
      0 0 40px rgba(6, 182, 212, 0.25);
  }
}

@keyframes hologram {
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
}

@keyframes aurora-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -20px) scale(1.08); }
  66% { transform: translate(-30px, 30px) scale(0.95); }
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); opacity: 0.8; }
  100% { transform: scale(1.6); opacity: 0; }
}

@keyframes scan-line {
  0%, 100% { opacity: 0.2; transform: translateX(-100%); }
  50% { opacity: 1; transform: translateX(100%); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "style: define design tokens, theme colors, and base utilities"
```

---

### Task 4: Configure fonts via next/font/google

**Files:**
- Replace: `prom-marketing/app/layout.tsx`

- [ ] **Step 1: Replace layout.tsx**

```tsx
import type { Metadata } from "next";
import { Syne, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-display",
  weight: ["500", "700", "800"],
});

const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext"],
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
    "Автоматизирай рутината с AI агенти. Поверявай ни процеси, връщай си времето. Запази безплатна консултация.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "bg_BG",
    siteName: "ProMarketing LTD",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="bg"
      className={`${syne.variable} ${interTight.variable} ${jetbrains.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Verify dev server compiles**

```bash
npm run dev
```

Expected: compiles without errors. Open http://localhost:3000, view source — `<html lang="bg">` and font CSS variables applied to body. Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: configure Syne, Inter Tight, JetBrains Mono via next/font"
```

---

### Task 5: Initialize shadcn/ui

**Files:**
- Create: `prom-marketing/components.json`
- Create: `prom-marketing/lib/utils.ts`
- Create: `prom-marketing/components/ui/button.tsx`
- Create: `prom-marketing/components/ui/card.tsx`
- Create: `prom-marketing/components/ui/accordion.tsx`
- Create: `prom-marketing/components/ui/dialog.tsx`
- Create: `prom-marketing/components/ui/table.tsx`
- Create: `prom-marketing/components/ui/sonner.tsx`

- [ ] **Step 1: Create lib/utils.ts**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Create components.json**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 3: Install shadcn primitives**

```bash
npx --yes shadcn@latest add button card accordion dialog table sonner --yes --overwrite
```

Expected: 6 components created in `components/ui/`.

- [ ] **Step 4: Verify by running typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components.json lib/utils.ts components/ui
git commit -m "feat: initialize shadcn/ui with button, card, accordion, dialog, table, sonner"
```

---

### Task 6: Vitest + Playwright configuration

**Files:**
- Create: `prom-marketing/vitest.config.ts`
- Create: `prom-marketing/tests/setup.ts`
- Create: `prom-marketing/playwright.config.ts`
- Modify: `prom-marketing/package.json` (scripts)

- [ ] **Step 1: Create vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 2: Create tests/setup.ts**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Create playwright.config.ts**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

- [ ] **Step 4: Add npm scripts**

Open `package.json` and replace the `"scripts"` block with:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:install": "playwright install --with-deps chromium"
  }
}
```

- [ ] **Step 5: Verify vitest config loads**

```bash
echo "test('boots', () => { expect(true).toBe(true); });" > tests/boot.test.ts
npm test
rm tests/boot.test.ts
```

Expected: 1 test passes.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts tests/setup.ts playwright.config.ts package.json
git commit -m "test: configure Vitest and Playwright"
```

---

## Phase 2 — Hooks and effects library

### Task 7: useReducedMotion hook

**Files:**
- Create: `prom-marketing/hooks/use-reduced-motion.ts`
- Create: `prom-marketing/hooks/use-reduced-motion.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useReducedMotion } from "./use-reduced-motion";

describe("useReducedMotion", () => {
  it("returns true when user prefers reduced motion", () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("returns false by default", () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });
});
```

- [ ] **Step 2: Run test (expect fail)**

```bash
npm test -- use-reduced-motion
```

Expected: FAIL with "Cannot find module".

- [ ] **Step 3: Implement hook**

```ts
"use client";
import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
```

- [ ] **Step 4: Run test (expect pass)**

```bash
npm test -- use-reduced-motion
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add hooks/use-reduced-motion.ts hooks/use-reduced-motion.test.ts
git commit -m "feat(hooks): add useReducedMotion"
```

---

### Task 8: useMousePosition hook

**Files:**
- Create: `prom-marketing/hooks/use-mouse-position.ts`

- [ ] **Step 1: Implement**

```ts
"use client";
import { useEffect, useRef, useState } from "react";

export interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition(target?: React.RefObject<HTMLElement | null>): MousePosition {
  const [pos, setPos] = useState<MousePosition>({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const el = target?.current ?? window;
    const handler = (e: MouseEvent) => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        if (target?.current) {
          const rect = target.current.getBoundingClientRect();
          setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        } else {
          setPos({ x: e.clientX, y: e.clientY });
        }
      });
    };
    el.addEventListener("mousemove", handler as EventListener);
    return () => {
      el.removeEventListener("mousemove", handler as EventListener);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [target]);

  return pos;
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add hooks/use-mouse-position.ts
git commit -m "feat(hooks): add useMousePosition with rAF throttling"
```

---

### Task 9: useScrollReveal hook + SectionReveal wrapper

**Files:**
- Create: `prom-marketing/hooks/use-scroll-reveal.ts`
- Create: `prom-marketing/components/effects/SectionReveal.tsx`

- [ ] **Step 1: Implement hook**

```ts
"use client";
import { useEffect, useRef, useState } from "react";

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  rootMargin = "-10% 0px"
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.05 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, visible };
}
```

- [ ] **Step 2: Implement wrapper**

```tsx
"use client";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "header" | "footer";
}

export function SectionReveal({ children, className, delay = 0, as: Tag = "div" }: Props) {
  const reduced = useReducedMotion();
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  const style: CSSProperties = reduced
    ? {}
    : {
        transitionDelay: `${delay}ms`,
        transitionDuration: "700ms",
        transitionProperty: "opacity, transform",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      };

  return (
    <Tag
      ref={ref as never}
      style={style}
      className={cn(
        reduced ? "" : visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className
      )}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add hooks/use-scroll-reveal.ts components/effects/SectionReveal.tsx
git commit -m "feat(effects): add useScrollReveal hook and SectionReveal wrapper"
```

---

### Task 10: useCounter hook + CounterRamp component

**Files:**
- Create: `prom-marketing/hooks/use-counter.ts`
- Create: `prom-marketing/hooks/use-counter.test.ts`
- Create: `prom-marketing/components/effects/CounterRamp.tsx`

- [ ] **Step 1: Write hook test**

```ts
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCounter } from "./use-counter";

describe("useCounter", () => {
  it("counts up to target when started", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCounter(100, 1000, true));
    expect(result.current).toBe(0);
    act(() => { vi.advanceTimersByTime(1100); });
    expect(result.current).toBe(100);
    vi.useRealTimers();
  });

  it("does not start when active=false", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCounter(50, 500, false));
    act(() => { vi.advanceTimersByTime(600); });
    expect(result.current).toBe(0);
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run test (fail)**

```bash
npm test -- use-counter
```

Expected: FAIL.

- [ ] **Step 3: Implement hook**

```ts
"use client";
import { useEffect, useState } from "react";

const easeOutOvershoot = (t: number) => {
  const c1 = 1.10;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export function useCounter(target: number, durationMs: number, active: boolean): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeOutOvershoot(t);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else setValue(target);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, active]);

  return value;
}
```

- [ ] **Step 4: Run test (pass)**

```bash
npm test -- use-counter
```

Expected: 2 tests pass.

- [ ] **Step 5: Implement CounterRamp**

```tsx
"use client";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useCounter } from "@/hooks/use-counter";

interface Props {
  target: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CounterRamp({ target, durationMs = 2200, prefix = "", suffix = "", className }: Props) {
  const { ref, visible } = useScrollReveal<HTMLSpanElement>();
  const value = useCounter(target, durationMs, visible);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString("bg-BG")}
      {suffix}
    </span>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add hooks/use-counter.ts hooks/use-counter.test.ts components/effects/CounterRamp.tsx
git commit -m "feat(effects): add useCounter and CounterRamp with easeOutOvershoot"
```

---

### Task 11: useMagnetic hook + MagneticButton

**Files:**
- Create: `prom-marketing/hooks/use-magnetic.ts`
- Create: `prom-marketing/components/effects/MagneticButton.tsx`

- [ ] **Step 1: Implement hook**

```ts
"use client";
import { useEffect, useRef } from "react";

export function useMagnetic<T extends HTMLElement>(strength = 0.35, radius = 60) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame: number | null = null;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const max = Math.max(rect.width, rect.height) / 2 + radius;
      if (dist > max) {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          el.style.transform = "translate3d(0,0,0)";
        });
        return;
      }
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
      });
    };

    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      el.style.transform = "translate3d(0,0,0)";
    };

    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    el.style.transition = "transform 250ms cubic-bezier(0.22, 1, 0.36, 1)";

    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [strength, radius]);

  return ref;
}
```

- [ ] **Step 2: Implement MagneticButton wrapper**

```tsx
"use client";
import { useMagnetic } from "@/hooks/use-magnetic";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  strength?: number;
  radius?: number;
}

export function MagneticButton({ children, className, strength = 0.35, radius = 60 }: Props) {
  const reduced = useReducedMotion();
  const ref = useMagnetic<HTMLDivElement>(reduced ? 0 : strength, radius);
  return (
    <div ref={ref} className={cn("inline-block will-change-transform", className)}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add hooks/use-magnetic.ts components/effects/MagneticButton.tsx
git commit -m "feat(effects): add useMagnetic hook and MagneticButton wrapper"
```

---

### Task 12: AuroraBackground

**Files:**
- Create: `prom-marketing/components/effects/AuroraBackground.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface Props {
  className?: string;
  intensity?: "subtle" | "normal" | "intense";
}

export function AuroraBackground({ className, intensity = "normal" }: Props) {
  const reduced = useReducedMotion();
  const opacity = intensity === "subtle" ? 0.45 : intensity === "intense" ? 0.85 : 0.65;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div
        className="absolute -top-1/3 -left-1/4 h-[80vh] w-[80vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.55) 0%, transparent 60%)",
          filter: "blur(60px)",
          opacity,
          animation: reduced ? "none" : "aurora-drift 22s ease-in-out infinite",
          mixBlendMode: "screen",
        }}
      />
      <div
        className="absolute top-1/4 -right-1/4 h-[70vh] w-[70vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 60%)",
          filter: "blur(60px)",
          opacity,
          animation: reduced ? "none" : "aurora-drift 28s ease-in-out infinite reverse",
          mixBlendMode: "screen",
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[55vh] w-[55vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 60%)",
          filter: "blur(80px)",
          opacity: opacity * 0.7,
          animation: reduced ? "none" : "aurora-drift 34s ease-in-out infinite",
          mixBlendMode: "screen",
        }}
      />
      <div className="absolute inset-0 grid-overlay opacity-40" />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/effects/AuroraBackground.tsx
git commit -m "feat(effects): add AuroraBackground with 3 drifting gradient blobs"
```

---

### Task 13: ParticleField (canvas)

**Files:**
- Create: `prom-marketing/components/effects/ParticleField.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface Props {
  density?: number;
  maxLinkDist?: number;
  className?: string;
}

export function ParticleField({ density = 40, maxLinkDist = 140, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let particles: Array<{ x: number; y: number; vx: number; vy: number }> = [];
    let mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: density }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const onLeave = () => { mouse = { x: -9999, y: -9999 }; };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > rect.width) p.vx *= -1;
        if (p.y < 0 || p.y > rect.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(125, 211, 252, 0.7)";
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < maxLinkDist) {
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.22 * (1 - d / maxLinkDist)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const a = particles[i];
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < maxLinkDist * 1.4) {
          ctx.strokeStyle = `rgba(236, 72, 153, ${0.35 * (1 - dm / (maxLinkDist * 1.4))})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [density, maxLinkDist, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-auto absolute inset-0 ${className ?? ""}`}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/effects/ParticleField.tsx
git commit -m "feat(effects): add ParticleField canvas with constellation links"
```

---

### Task 14: SpotlightCursor

**Files:**
- Create: `prom-marketing/components/effects/SpotlightCursor.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function SpotlightCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const dot = dotRef.current;
    if (!dot) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const tick = () => {
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      dot.style.transform = `translate3d(${cx - 240}px, ${cy - 240}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    tick();
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[1] h-[480px] w-[480px] rounded-full will-change-transform"
      style={{
        background:
          "radial-gradient(circle, rgba(6,182,212,0.18) 0%, rgba(124,58,237,0.10) 40%, transparent 70%)",
        mixBlendMode: "screen",
        filter: "blur(20px)",
      }}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/effects/SpotlightCursor.tsx
git commit -m "feat(effects): add SpotlightCursor following mouse with lerp"
```

---

### Task 15: TextScramble

**Files:**
- Create: `prom-marketing/components/effects/TextScramble.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const CHARS = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯABCDEFGHJKLMNOPQRSTUVWXYZ0123456789!@#$%&*_+";

interface Props {
  text: string;
  durationMs?: number;
  className?: string;
}

export function TextScramble({ text, durationMs = 900, className }: Props) {
  const [out, setOut] = useState(text);
  const startedRef = useRef(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || startedRef.current) return;
    startedRef.current = true;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const revealed = Math.floor(t * text.length);
      let next = "";
      for (let i = 0; i < text.length; i++) {
        if (i < revealed) next += text[i];
        else if (text[i] === " ") next += " ";
        else next += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      setOut(next);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setOut(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, durationMs, reduced]);

  return <span className={className}>{out}</span>;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/effects/TextScramble.tsx
git commit -m "feat(effects): add TextScramble with Cyrillic + Latin charset"
```

---

### Task 16: HolographicText

**Files:**
- Create: `prom-marketing/components/effects/HolographicText.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3";
}

export function HolographicText({ children, className, as: Tag = "span" }: Props) {
  return <Tag className={cn("text-holographic", className)}>{children}</Tag>;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/effects/HolographicText.tsx
git commit -m "feat(effects): add HolographicText shimmer wrapper"
```

---

### Task 17: TiltCard

**Files:**
- Create: `prom-marketing/components/effects/TiltCard.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface Props {
  children: ReactNode;
  className?: string;
  maxTiltDeg?: number;
  glow?: boolean;
}

export function TiltCard({ children, className, maxTiltDeg = 8, glow = true }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * maxTiltDeg * 2;
    const ry = (px - 0.5) * maxTiltDeg * 2;
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn(
        "group relative [transform-style:preserve-3d] transition-transform duration-300 ease-out",
        "[transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]",
        className
      )}
      style={{ ["--rx" as never]: "0deg", ["--ry" as never]: "0deg" }}
    >
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), rgba(6,182,212,0.16), transparent 60%)",
          }}
        />
      )}
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/effects/TiltCard.tsx
git commit -m "feat(effects): add TiltCard with 3D perspective tilt and cursor glow"
```

---

### Task 18: ScrollProgress

**Files:**
- Create: `prom-marketing/components/effects/ScrollProgress.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setProgress(total > 0 ? h.scrollTop / total : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed right-3 top-0 z-50 h-screen w-[2px]">
      <div
        className="origin-top transition-transform duration-150"
        style={{
          transform: `scaleY(${progress})`,
          background: "linear-gradient(to bottom, #06b6d4, #7c3aed, #ec4899)",
          height: "100%",
          boxShadow: "0 0 12px rgba(6,182,212,0.6)",
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/effects/ScrollProgress.tsx
git commit -m "feat(effects): add ScrollProgress fixed gradient line"
```

---

### Task 19: ShaderOrb (Three.js, dynamic-imported)

**Files:**
- Create: `prom-marketing/components/effects/ShaderOrb.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

function Sphere() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    m.rotation.y = state.clock.elapsedTime * 0.18;
    m.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.2;
    const pointer = state.pointer;
    m.position.x = pointer.x * 0.4;
    m.position.y = pointer.y * 0.3;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.4, 5]} />
      <meshPhysicalMaterial
        color="#0e7490"
        roughness={0.15}
        metalness={0.85}
        clearcoat={1}
        clearcoatRoughness={0.1}
        iridescence={1}
        iridescenceIOR={1.6}
        iridescenceThicknessRange={[100, 800]}
        emissive="#7c3aed"
        emissiveIntensity={0.25}
      />
    </mesh>
  );
}

export function ShaderOrb() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={1.4} color="#06b6d4" />
        <pointLight position={[-3, -2, 2]} intensity={1.2} color="#7c3aed" />
        <Sphere />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add components/effects/ShaderOrb.tsx
git commit -m "feat(effects): add ShaderOrb iridescent Three.js sphere"
```

---

## Phase 3 — Landing sections

### Task 20: Navbar

**Files:**
- Create: `prom-marketing/components/landing/Navbar.tsx`
- Create: `prom-marketing/components/landing/Logo.tsx`
- Create: `prom-marketing/lib/cal/embed.ts`

- [ ] **Step 1: Create Cal.com embed launcher**

```ts
"use client";
import { getCalApi } from "@calcom/embed-react";

const USERNAME = process.env.NEXT_PUBLIC_CAL_USERNAME ?? "promarketing";
const SLUG = process.env.NEXT_PUBLIC_CAL_EVENT_SLUG ?? "consultation";

export const CAL_LINK = `${USERNAME}/${SLUG}`;

export async function initCalEmbed() {
  const cal = await getCalApi({ namespace: "consultation" });
  cal("ui", {
    theme: "dark",
    cssVarsPerTheme: {
      dark: {
        "cal-brand": "#06b6d4",
        "cal-bg-emphasis": "#0a0a1f",
        "cal-bg": "#030308",
        "cal-text": "#f5f7ff",
      },
    },
    hideEventTypeDetails: false,
  });
  return cal;
}

export async function openBookingPopup() {
  const cal = await initCalEmbed();
  cal("modal", { calLink: CAL_LINK });
}
```

- [ ] **Step 2: Create Logo**

```tsx
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        aria-hidden
        className="h-7 w-7 rounded-md"
        style={{
          background:
            "conic-gradient(from 200deg, #06b6d4, #7c3aed, #ec4899, #06b6d4)",
          boxShadow: "0 0 18px rgba(6,182,212,0.35)",
        }}
      />
      <span className="font-display text-lg font-bold tracking-tight">
        Pro<span className="text-holographic">Marketing</span>
      </span>
    </div>
  );
}
```

- [ ] **Step 3: Create Navbar**

```tsx
"use client";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { openBookingPopup } from "@/lib/cal/embed";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#services", label: "Услуги" },
  { href: "#process", label: "Процес" },
  { href: "#industries", label: "За кого" },
  { href: "#faq", label: "Въпроси" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4 transition-all duration-300",
        scrolled ? "pt-2" : "pt-4"
      )}
    >
      <nav
        className={cn(
          "flex w-full max-w-6xl items-center justify-between rounded-full px-5 py-2.5 transition-all duration-300",
          scrolled ? "glass shadow-[0_0_30px_rgba(6,182,212,0.08)]" : "bg-transparent"
        )}
      >
        <a href="#top" aria-label="ProMarketing начало">
          <Logo />
        </a>
        <ul className="hidden md:flex items-center gap-7 text-sm text-[var(--color-text-secondary)]">
          {NAV.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="transition-colors hover:text-[var(--color-text-primary)]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => void openBookingPopup()}
          className="relative inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-cyan)] px-4 py-2 text-sm font-semibold text-[var(--color-bg-void)] transition-transform hover:scale-[1.03]"
        >
          Запази среща
          <span aria-hidden>→</span>
        </button>
      </nav>
    </header>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/landing/Navbar.tsx components/landing/Logo.tsx lib/cal/embed.ts
git commit -m "feat(landing): add Navbar, Logo, and Cal.com embed launcher"
```

---

### Task 21: Hero

**Files:**
- Create: `prom-marketing/components/landing/Hero.tsx`
- Create: `prom-marketing/components/landing/HeroOrb.tsx`

- [ ] **Step 1: Create dynamic orb wrapper**

```tsx
"use client";
import dynamic from "next/dynamic";

const ShaderOrb = dynamic(
  () => import("@/components/effects/ShaderOrb").then((m) => m.ShaderOrb),
  { ssr: false, loading: () => null }
);

export function HeroOrb() {
  return <ShaderOrb />;
}
```

- [ ] **Step 2: Create Hero**

```tsx
"use client";
import { AuroraBackground } from "@/components/effects/AuroraBackground";
import { ParticleField } from "@/components/effects/ParticleField";
import { TextScramble } from "@/components/effects/TextScramble";
import { HolographicText } from "@/components/effects/HolographicText";
import { MagneticButton } from "@/components/effects/MagneticButton";
import { HeroOrb } from "./HeroOrb";
import { openBookingPopup } from "@/lib/cal/embed";

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

      <div className="relative z-[3] mx-auto flex max-w-6xl flex-col items-start justify-center px-6 pt-44 pb-32 lg:min-h-[100svh] lg:pt-32">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] px-3 py-1 text-xs font-mono uppercase tracking-[0.18em] text-[var(--color-accent-cyan)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-cyan)] shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          AI · Automation · Growth
        </span>

        <h1 className="max-w-3xl font-display text-[clamp(48px,8vw,120px)] font-bold leading-[0.95] tracking-tight">
          <TextScramble text="Автоматизирай" />{" "}
          <HolographicText>бизнеса си</HolographicText>{" "}
          с AI агенти.
        </h1>

        <p className="mt-8 max-w-xl text-lg text-[var(--color-text-secondary)] md:text-xl">
          Превръщаме рутината в растеж. Изграждаме AI агенти, които работят
          24/7 — отговарят на клиенти, квалифицират лийдове и автоматизират
          процесите, които те бавят.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <MagneticButton>
            <button
              type="button"
              onClick={() => void openBookingPopup()}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[var(--color-accent-cyan)] px-7 py-4 text-base font-semibold text-[var(--color-bg-void)] shadow-[0_0_40px_rgba(6,182,212,0.35)] transition-shadow hover:shadow-[0_0_60px_rgba(6,182,212,0.55)]"
            >
              <span>Запази безплатна консултация</span>
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </MagneticButton>
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
```

- [ ] **Step 3: Verify dev server renders**

```bash
npm run dev
```

Open http://localhost:3000 and create a temporary page in `app/page.tsx` if needed (we'll do the real one in Task 30). For now, render `<Hero />` to confirm visuals. Stop server.

- [ ] **Step 4: Commit**

```bash
git add components/landing/Hero.tsx components/landing/HeroOrb.tsx
git commit -m "feat(landing): add Hero with aurora, particles, orb, scramble, holographic text"
```

---

### Task 22: TrustStrip

**Files:**
- Create: `prom-marketing/components/landing/TrustStrip.tsx`

- [ ] **Step 1: Implement**

```tsx
import { CounterRamp } from "@/components/effects/CounterRamp";

const STATS = [
  { target: 100, suffix: "+", label: "Автоматизирани процеса" },
  { target: 24, suffix: "/7", label: "Работа без пауза" },
  { target: 60, suffix: "%", label: "Средно спестено време" },
];

export function TrustStrip() {
  return (
    <section className="relative border-y border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/40 py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 md:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-center text-center md:items-start md:text-left">
            <span className="font-display text-5xl font-bold tracking-tight text-[var(--color-text-primary)]">
              <CounterRamp target={s.target} suffix={s.suffix} />
            </span>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/TrustStrip.tsx
git commit -m "feat(landing): add TrustStrip with animated counters"
```

---

### Task 23: Services bento grid

**Files:**
- Create: `prom-marketing/components/landing/Services.tsx`
- Create: `prom-marketing/components/landing/LiveChatFeed.tsx`

- [ ] **Step 1: Create LiveChatFeed**

```tsx
"use client";
import { useEffect, useState } from "react";

const MESSAGES = [
  { author: "Клиент", body: "Здравейте, искам да поръчам..." },
  { author: "AI Агент", body: "Здравейте! Веднага ви помагам. Кой продукт..." },
  { author: "Клиент", body: "Колко струва доставката?" },
  { author: "AI Агент", body: "До 24ч безплатно за поръчки над 50 лв ✓" },
];

export function LiveChatFeed() {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const msg = MESSAGES[idx].body;
    setTyped("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(msg.slice(0, i));
      if (i >= msg.length) {
        clearInterval(interval);
        setTimeout(() => setIdx((v) => (v + 1) % MESSAGES.length), 1800);
      }
    }, 28);
    return () => clearInterval(interval);
  }, [idx]);

  const m = MESSAGES[idx];

  return (
    <div className="font-mono text-sm">
      <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
        {m.author}
      </div>
      <p className="text-[var(--color-text-primary)]">
        {typed}
        <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-[var(--color-accent-cyan)] align-middle" />
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create Services**

```tsx
import { Bot, Mail, Database, Mic, Filter, Sparkles } from "lucide-react";
import { TiltCard } from "@/components/effects/TiltCard";
import { SectionReveal } from "@/components/effects/SectionReveal";
import { LiveChatFeed } from "./LiveChatFeed";

const SERVICES = [
  {
    icon: Bot,
    title: "AI чат агенти",
    body: "24/7 поддръжка, продажби и квалификация на лийдове по Messenger, Viber, Instagram и сайт.",
    feature: true,
  },
  {
    icon: Mail,
    title: "Email и SMS автоматизация",
    body: "Персонализирани имейл секвенции, сегментация на база поведение, винаги навреме.",
  },
  {
    icon: Database,
    title: "CRM интеграции",
    body: "Свързваме Salesforce, HubSpot, Pipedrive, Bitrix със системите ти и автоматизираме записите.",
  },
  {
    icon: Mic,
    title: "Гласови AI агенти",
    body: "Изходящи и входящи обаждания на естествен български — потвърждения, заявки, follow-ups.",
  },
  {
    icon: Filter,
    title: "Lead qualification",
    body: "AI скоринг и приоритизация — продажбите получават само горещите контакти.",
  },
  {
    icon: Sparkles,
    title: "Content генерация",
    body: "Блог постове, продуктови описания, социални публикации — на твоя глас, в твоето темпо.",
  },
];

export function Services() {
  return (
    <section id="services" className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionReveal>
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent-cyan)]">
              // услуги
            </p>
            <h2 className="font-display text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Шест начина да автоматизираш бизнеса си
            </h2>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:grid-rows-2">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <SectionReveal key={s.title} delay={i * 80} className={s.feature ? "md:col-span-2" : ""}>
                <TiltCard className="h-full rounded-2xl">
                  <div className="glass relative h-full rounded-2xl p-7">
                    <Icon className="mb-5 h-7 w-7 text-[var(--color-accent-cyan)]" strokeWidth={1.5} />
                    <h3 className="font-display text-xl font-bold">{s.title}</h3>
                    <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{s.body}</p>
                    {s.feature && (
                      <div className="mt-6 rounded-xl bg-[var(--color-bg-void)]/70 p-5">
                        <LiveChatFeed />
                      </div>
                    )}
                  </div>
                </TiltCard>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/landing/Services.tsx components/landing/LiveChatFeed.tsx
git commit -m "feat(landing): add Services bento grid with LiveChatFeed featured card"
```

---

### Task 24: Process (animated step line)

**Files:**
- Create: `prom-marketing/components/landing/Process.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { SectionReveal } from "@/components/effects/SectionReveal";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const STEPS = [
  {
    num: "01",
    title: "Разговор",
    body: "Чуваме твоя бизнес и идентифицираме процесите, които изяждат най-много време.",
  },
  {
    num: "02",
    title: "Анализ",
    body: "Картираме workflow-овете, измерваме разходите и определяме приоритетите.",
  },
  {
    num: "03",
    title: "Изграждане",
    body: "Изграждаме и обучаваме AI агентите във вашата среда — без техническа намеса от вас.",
  },
  {
    num: "04",
    title: "Стартиране",
    body: "Тестваме, пускаме на живо, измерваме резултатите и оптимизираме всеки месец.",
  },
];

export function Process() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="process" className="relative py-32">
      <div className="mx-auto max-w-5xl px-6">
        <SectionReveal>
          <div className="mb-20 max-w-2xl">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent-cyan)]">
              // процес
            </p>
            <h2 className="font-display text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Четири стъпки от идея до резултат
            </h2>
          </div>
        </SectionReveal>

        <div ref={ref} className="relative">
          <svg
            aria-hidden
            className="absolute left-[27px] top-0 hidden h-full w-[2px] md:block"
            viewBox="0 0 2 1000"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="processLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <line
              x1="1" y1="0" x2="1" y2="1000"
              stroke="url(#processLine)"
              strokeWidth="2"
              strokeDasharray="1000"
              strokeDashoffset={visible ? 0 : 1000}
              style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1)" }}
            />
          </svg>

          <ol className="space-y-14 md:space-y-20">
            {STEPS.map((step, i) => (
              <SectionReveal key={step.num} delay={i * 120} as="article">
                <li className="grid grid-cols-[56px_1fr] items-start gap-6 md:gap-10">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full glass">
                    <span className="font-mono text-sm text-[var(--color-accent-cyan)]">{step.num}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold md:text-3xl">{step.title}</h3>
                    <p className="mt-3 max-w-lg text-[var(--color-text-secondary)]">{step.body}</p>
                  </div>
                </li>
              </SectionReveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/Process.tsx
git commit -m "feat(landing): add Process section with SVG line draw on scroll"
```

---

### Task 25: Industries

**Files:**
- Create: `prom-marketing/components/landing/Industries.tsx`

- [ ] **Step 1: Implement**

```tsx
import { SectionReveal } from "@/components/effects/SectionReveal";
import { TiltCard } from "@/components/effects/TiltCard";
import { ShoppingBag, Home, UtensilsCrossed, Stethoscope, Scale, Dumbbell, Briefcase } from "lucide-react";

const INDUSTRIES = [
  { icon: ShoppingBag, name: "E-commerce", use: "Автоматичен ретаргетинг и AI customer support" },
  { icon: Home, name: "Имоти", use: "Квалификация на купувачи и автоматични огледи" },
  { icon: UtensilsCrossed, name: "Ресторанти", use: "Резервации, ревюта, лоялност" },
  { icon: Stethoscope, name: "Медицински клиники", use: "Записване на часове и follow-up на пациенти" },
  { icon: Scale, name: "Юристи", use: "Първоначална консултация и документи" },
  { icon: Dumbbell, name: "Фитнес и студия", use: "Резервации, retention, membership" },
  { icon: Briefcase, name: "B2B услуги", use: "Lead nurturing и предложения" },
];

export function Industries() {
  return (
    <section id="industries" className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionReveal>
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent-cyan)]">
              // за кого
            </p>
            <h2 className="font-display text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Подходящо за всеки бизнес, който иска повече
            </h2>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <SectionReveal key={ind.name} delay={i * 60}>
                <TiltCard className="h-full rounded-xl" maxTiltDeg={6}>
                  <div className="glass flex h-full items-start gap-4 rounded-xl p-6">
                    <Icon className="h-6 w-6 shrink-0 text-[var(--color-accent-violet)]" strokeWidth={1.5} />
                    <div>
                      <h3 className="font-display text-lg font-bold">{ind.name}</h3>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{ind.use}</p>
                    </div>
                  </div>
                </TiltCard>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/Industries.tsx
git commit -m "feat(landing): add Industries grid with 7 verticals"
```

---

### Task 26: WhyUs

**Files:**
- Create: `prom-marketing/components/landing/WhyUs.tsx`

- [ ] **Step 1: Implement**

```tsx
import { SectionReveal } from "@/components/effects/SectionReveal";
import { Zap, Wand2, ShieldCheck } from "lucide-react";

const POINTS = [
  {
    icon: Zap,
    title: "Резултати за седмици, не месеци",
    body: "Типичен проект стартира за 2-4 седмици. Без дълги дискавъри и презентации — фокус върху impact.",
  },
  {
    icon: Wand2,
    title: "Без техническа сложност за теб",
    body: "Ние се занимаваме с интеграциите. Ти виждаш само рапортите и резултатите.",
  },
  {
    icon: ShieldCheck,
    title: "Прозрачно ценообразуване",
    body: "Никакви скрити такси. Фиксирана цена, ясни срокове, ясни KPI-та.",
  },
];

export function WhyUs() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionReveal>
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent-cyan)]">
              // защо нас
            </p>
            <h2 className="font-display text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Не само агенция. Технологичен партньор.
            </h2>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {POINTS.map((p, i) => {
            const Icon = p.icon;
            return (
              <SectionReveal key={p.title} delay={i * 100}>
                <div className="flex flex-col">
                  <Icon className="mb-5 h-10 w-10 text-[var(--color-accent-cyan)]" strokeWidth={1.2} />
                  <h3 className="font-display text-2xl font-bold">{p.title}</h3>
                  <p className="mt-3 text-[var(--color-text-secondary)]">{p.body}</p>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/WhyUs.tsx
git commit -m "feat(landing): add WhyUs section with three differentiators"
```

---

### Task 27: FAQ accordion

**Files:**
- Create: `prom-marketing/components/landing/FAQ.tsx`

- [ ] **Step 1: Implement**

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionReveal } from "@/components/effects/SectionReveal";

const QA = [
  {
    q: "Колко време отнема стартирането на първа автоматизация?",
    a: "Между 2 и 4 седмици, в зависимост от сложността. Прости чатботове и имейл секвенции тръгват за 7-10 дни. Сложни CRM интеграции с гласови агенти стигат до 6 седмици.",
  },
  {
    q: "Колко струва?",
    a: "Цената е базирана на обхвата и нивото на интеграция. На първата (безплатна) консултация даваме конкретна цена и срок след като чуем какво ти трябва.",
  },
  {
    q: "Какви технически изисквания имам?",
    a: "Минимални. Имаш ли вече CRM, email платформа или съществуващ сайт — работим с тях. Ако нямаш — ние препоръчваме и настройваме.",
  },
  {
    q: "Кой поддържа агентите след стартирането?",
    a: "Ние, по абонамент. Това включва наблюдение, обновяване на знанието на агента, оптимизации и месечни отчети.",
  },
  {
    q: "Гарантирате ли резултати?",
    a: "Гарантираме доставка спрямо договорения обхват и KPI-та. Ако автоматизация не отговаря на критериите ни за качество, я преработваме без допълнителна цена.",
  },
  {
    q: "Работим ли с малки бизнеси?",
    a: "Да. Имаме решения от един процес/агент за soloprenori до пълни workflows за корпоративни клиенти.",
  },
  {
    q: "Кои AI модели използвате?",
    a: "Предимно OpenAI (GPT-4 family), Anthropic Claude и open-source модели за специфични задачи. Изборът зависи от случая и privacy изискванията.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative py-32">
      <div className="mx-auto max-w-3xl px-6">
        <SectionReveal>
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent-cyan)]">
              // въпроси
            </p>
            <h2 className="font-display text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Често задавани въпроси
            </h2>
          </div>
        </SectionReveal>

        <SectionReveal>
          <Accordion type="single" collapsible className="space-y-3">
            {QA.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="glass rounded-xl border-0 px-5"
              >
                <AccordionTrigger className="py-5 text-left font-display text-lg font-semibold hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[var(--color-text-secondary)]">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </SectionReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/FAQ.tsx
git commit -m "feat(landing): add FAQ accordion with 7 questions"
```

---

### Task 28: FinalCTA with pulse rings + confetti

**Files:**
- Create: `prom-marketing/components/landing/FinalCTA.tsx`
- Create: `prom-marketing/components/effects/BookingConfetti.tsx`

- [ ] **Step 1: Create BookingConfetti**

```tsx
"use client";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function BookingConfetti() {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const fire = () => {
      const opts = {
        spread: 80,
        ticks: 200,
        gravity: 0.7,
        scalar: 0.9,
        colors: ["#06b6d4", "#7c3aed", "#ec4899", "#f5f7ff"],
      };
      confetti({ ...opts, origin: { x: 0.25, y: 0.4 }, particleCount: 80, angle: 60 });
      confetti({ ...opts, origin: { x: 0.75, y: 0.4 }, particleCount: 80, angle: 120 });
    };
    const onMessage = (e: MessageEvent) => {
      const data = e.data as { type?: string };
      if (data?.type === "bookingSuccessful" || data?.type === "calcom:booking_successful") {
        fire();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [reduced]);
  return null;
}
```

- [ ] **Step 2: Create FinalCTA**

```tsx
"use client";
import { AuroraBackground } from "@/components/effects/AuroraBackground";
import { MagneticButton } from "@/components/effects/MagneticButton";
import { SectionReveal } from "@/components/effects/SectionReveal";
import { openBookingPopup } from "@/lib/cal/embed";
import { CAL_LINK } from "@/lib/cal/embed";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-40">
      <AuroraBackground intensity="intense" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <SectionReveal>
          <h2 className="font-display text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Готов ли си да автоматизираш?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--color-text-secondary)]">
            30 минути разговор. Без презентации. Излизаш с конкретен план.
          </p>
        </SectionReveal>

        <SectionReveal delay={180}>
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="relative">
              <span
                aria-hidden
                className="absolute inset-0 -m-2 rounded-full"
                style={{
                  boxShadow: "0 0 0 0 rgba(6,182,212,0.5)",
                  animation: "pulse-ring 2.4s cubic-bezier(0.22,1,0.36,1) infinite",
                }}
              />
              <span
                aria-hidden
                className="absolute inset-0 -m-2 rounded-full"
                style={{
                  boxShadow: "0 0 0 0 rgba(124,58,237,0.4)",
                  animation: "pulse-ring 2.4s cubic-bezier(0.22,1,0.36,1) infinite 0.8s",
                }}
              />
              <MagneticButton strength={0.45} radius={80}>
                <button
                  type="button"
                  onClick={() => void openBookingPopup()}
                  className="relative inline-flex items-center gap-3 rounded-full bg-[var(--color-accent-cyan)] px-8 py-5 text-lg font-semibold text-[var(--color-bg-void)] shadow-[0_0_60px_rgba(6,182,212,0.45)]"
                >
                  Запази среща сега
                  <span aria-hidden>→</span>
                </button>
              </MagneticButton>
            </div>
            <a
              href={`https://cal.com/${CAL_LINK}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            >
              или отвори календара на cal.com →
            </a>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/landing/FinalCTA.tsx components/effects/BookingConfetti.tsx
git commit -m "feat(landing): add FinalCTA with pulse rings and BookingConfetti"
```

---

### Task 29: Footer

**Files:**
- Create: `prom-marketing/components/landing/Footer.tsx`

- [ ] **Step 1: Implement**

```tsx
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/40 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-[var(--color-text-secondary)]">
            AI автоматизации, които превръщат рутината в растеж.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
            Сайт
          </h4>
          <ul className="space-y-2 text-sm">
            <li><a className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" href="#services">Услуги</a></li>
            <li><a className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" href="#process">Процес</a></li>
            <li><a className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" href="#industries">За кого</a></li>
            <li><a className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" href="#faq">Въпроси</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
            Контакти
          </h4>
          <ul className="space-y-2 text-sm">
            <li><a className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" href="mailto:hello@promarketing.bg">hello@promarketing.bg</a></li>
            <li className="text-[var(--color-text-secondary)]">София, България</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
            Правни
          </h4>
          <ul className="space-y-2 text-sm">
            <li><a className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" href="/privacy">Поверителност</a></li>
            <li><a className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" href="/terms">Условия</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-6xl border-t border-[var(--color-border-default)] px-6 pt-6 text-xs text-[var(--color-text-tertiary)]">
        © {year} ProMarketing LTD. Всички права запазени.
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/Footer.tsx
git commit -m "feat(landing): add Footer with sitemap, contact, legal"
```

---

### Task 30: Compose landing page

**Files:**
- Replace: `prom-marketing/app/page.tsx`

- [ ] **Step 1: Replace page.tsx**

```tsx
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { Services } from "@/components/landing/Services";
import { Process } from "@/components/landing/Process";
import { Industries } from "@/components/landing/Industries";
import { WhyUs } from "@/components/landing/WhyUs";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { SpotlightCursor } from "@/components/effects/SpotlightCursor";
import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { BookingConfetti } from "@/components/effects/BookingConfetti";
import { Toaster } from "@/components/ui/sonner";

export default function HomePage() {
  return (
    <>
      <SpotlightCursor />
      <ScrollProgress />
      <BookingConfetti />
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <Services />
        <Process />
        <Industries />
        <WhyUs />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <Toaster theme="dark" position="bottom-right" />
    </>
  );
}
```

- [ ] **Step 2: Verify dev server**

```bash
npm run dev
```

Open http://localhost:3000. Confirm all sections render in order, scroll reveals work, Hero orb appears on desktop, particle field interactions feel right, CTAs visually attract cursor. Stop server.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(landing): compose full landing page from sections"
```

---

## Phase 4 — Cal.com webhook + Supabase

### Task 31: Cal.com type definitions + Zod schema

**Files:**
- Create: `prom-marketing/lib/cal/types.ts`

- [ ] **Step 1: Implement**

```ts
import { z } from "zod";

export const calBookingSchema = z.object({
  triggerEvent: z.enum([
    "BOOKING_CREATED",
    "BOOKING_RESCHEDULED",
    "BOOKING_CANCELLED",
  ]),
  payload: z.object({
    uid: z.string(),
    title: z.string().optional(),
    startTime: z.string(),
    endTime: z.string(),
    attendees: z.array(
      z.object({
        name: z.string(),
        email: z.string().email(),
        timeZone: z.string().optional(),
      })
    ),
    responses: z
      .object({
        phone: z.union([z.string(), z.object({ value: z.string() })]).optional(),
      })
      .passthrough()
      .optional(),
    status: z.string().optional(),
  }),
  createdAt: z.string().optional(),
});

export type CalBookingPayload = z.infer<typeof calBookingSchema>;

export function extractPhone(p: CalBookingPayload["payload"]): string | null {
  const raw = p.responses?.phone;
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "value" in raw) return raw.value;
  return null;
}

export function statusFromTrigger(t: CalBookingPayload["triggerEvent"]): string {
  switch (t) {
    case "BOOKING_CANCELLED": return "cancelled";
    case "BOOKING_RESCHEDULED": return "rescheduled";
    default: return "confirmed";
  }
}

export function durationMinutes(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/cal/types.ts
git commit -m "feat(cal): add Zod schemas and helpers for Cal.com webhook payloads"
```

---

### Task 32: HMAC verifier with TDD

**Files:**
- Create: `prom-marketing/lib/cal/verify-webhook.test.ts`
- Create: `prom-marketing/lib/cal/verify-webhook.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from "vitest";
import crypto from "node:crypto";
import { verifyCalSignature } from "./verify-webhook";

const SECRET = "test-secret-123";

function sign(body: string, secret = SECRET) {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

describe("verifyCalSignature", () => {
  it("returns true for a matching signature", () => {
    const body = JSON.stringify({ hello: "world" });
    const sig = sign(body);
    expect(verifyCalSignature(body, sig, SECRET)).toBe(true);
  });

  it("returns false for a mismatched signature", () => {
    const body = JSON.stringify({ hello: "world" });
    expect(verifyCalSignature(body, "deadbeef", SECRET)).toBe(false);
  });

  it("returns false for an empty signature", () => {
    expect(verifyCalSignature("body", "", SECRET)).toBe(false);
  });

  it("returns false for a body tampered with after signing", () => {
    const body = JSON.stringify({ hello: "world" });
    const sig = sign(body);
    expect(verifyCalSignature(body + "x", sig, SECRET)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test (fail)**

```bash
npm test -- verify-webhook
```

- [ ] **Step 3: Implement**

```ts
import crypto from "node:crypto";

export function verifyCalSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string
): boolean {
  if (!signatureHeader) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "hex");
  let b: Buffer;
  try {
    b = Buffer.from(signatureHeader, "hex");
  } catch {
    return false;
  }
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
```

- [ ] **Step 4: Run test (pass)**

```bash
npm test -- verify-webhook
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/cal/verify-webhook.ts lib/cal/verify-webhook.test.ts
git commit -m "feat(cal): add HMAC signature verifier with timing-safe equality"
```

---

### Task 33: Supabase migrations

**Files:**
- Create: `prom-marketing/supabase/migrations/20260520120000_create_bookings.sql`
- Create: `prom-marketing/supabase/migrations/20260520120100_create_webhook_log.sql`
- Create: `prom-marketing/supabase/migrations/20260520120200_admin_role_check.sql`

- [ ] **Step 1: Create bookings migration**

```sql
create extension if not exists "pgcrypto";

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  cal_booking_id text not null unique,
  attendee_name text not null,
  attendee_email text not null,
  attendee_phone text,
  scheduled_at timestamptz not null,
  duration_minutes integer not null,
  status text not null default 'confirmed',
  raw_payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_scheduled_at_idx on public.bookings (scheduled_at desc);
create index bookings_email_idx on public.bookings (attendee_email);
create index bookings_status_idx on public.bookings (status);

alter table public.bookings enable row level security;

-- service role inserts/updates from webhook (bypasses RLS by design)
-- only authenticated admins can SELECT
create policy "admins can select bookings"
  on public.bookings
  for select
  to authenticated
  using (public.is_admin_email((auth.jwt() ->> 'email')::text));
```

- [ ] **Step 2: Create webhook log migration**

```sql
create table public.cal_webhook_log (
  id uuid primary key default gen_random_uuid(),
  event_type text,
  payload jsonb,
  signature_valid boolean not null,
  processed_at timestamptz not null default now(),
  error text
);

create index cal_webhook_log_processed_at_idx on public.cal_webhook_log (processed_at desc);

alter table public.cal_webhook_log enable row level security;

create policy "admins can select webhook log"
  on public.cal_webhook_log
  for select
  to authenticated
  using (public.is_admin_email((auth.jwt() ->> 'email')::text));
```

- [ ] **Step 3: Create admin role function migration**

```sql
create or replace function public.is_admin_email(email_input text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    email_input = any(string_to_array(current_setting('app.allowed_admin_emails', true), ',')),
    false
  );
$$;

-- NOTE: The setting app.allowed_admin_emails must be configured via Supabase Dashboard
-- → Settings → Database → Custom Postgres Config:
--   app.allowed_admin_emails = 'owner@promarketing.bg,other@promarketing.bg'
-- After changing, run: select pg_reload_conf();
```

- [ ] **Step 4: Document migration apply step in README**

(We'll create README.md in a later task. For now just commit the SQL.)

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations
git commit -m "feat(db): bookings, webhook log, and admin email allowlist function"
```

---

### Task 34: Supabase clients (browser, server, middleware)

**Files:**
- Create: `prom-marketing/lib/supabase/client.ts`
- Create: `prom-marketing/lib/supabase/server.ts`
- Create: `prom-marketing/lib/supabase/middleware.ts`
- Create: `prom-marketing/lib/supabase/service.ts`

- [ ] **Step 1: Browser client**

```ts
"use client";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Server client**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // called from a Server Component — middleware handles session refresh
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Middleware client**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const isAdminRoute = url.pathname.startsWith("/admin");
  const isLoginPage = url.pathname === "/admin/login";
  const allowed = (process.env.ALLOWED_ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (isAdminRoute && !isLoginPage) {
    if (!user) {
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    if (user.email && !allowed.includes(user.email.toLowerCase())) {
      await supabase.auth.signOut();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "forbidden");
      return NextResponse.redirect(url);
    }
  }

  if (isLoginPage && user && user.email && allowed.includes(user.email.toLowerCase())) {
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
```

- [ ] **Step 4: Service-role client (server-only)**

```ts
import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
```

- [ ] **Step 5: Add the `server-only` package**

```bash
npm install server-only
```

- [ ] **Step 6: Commit**

```bash
git add lib/supabase package.json package-lock.json
git commit -m "feat(supabase): add browser, server, middleware, and service clients"
```

---

### Task 35: middleware.ts

**Files:**
- Create: `prom-marketing/middleware.ts`

- [ ] **Step 1: Implement**

```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)",
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add Next.js middleware for Supabase session refresh and admin gating"
```

---

### Task 36: Webhook route (with integration test)

**Files:**
- Create: `prom-marketing/app/api/webhooks/cal/route.ts`
- Create: `prom-marketing/app/api/webhooks/cal/route.test.ts`

- [ ] **Step 1: Implement route**

```ts
import { NextResponse } from "next/server";
import { calBookingSchema, extractPhone, statusFromTrigger, durationMinutes } from "@/lib/cal/types";
import { verifyCalSignature } from "@/lib/cal/verify-webhook";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-cal-signature-256");
  const secret = process.env.CAL_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const valid = verifyCalSignature(rawBody, signature, secret);

  const supabase = createServiceClient();

  if (!valid) {
    await supabase.from("cal_webhook_log").insert({
      event_type: null,
      payload: safeParse(rawBody),
      signature_valid: false,
      error: "invalid_signature",
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const json = safeParse(rawBody);
  const parsed = calBookingSchema.safeParse(json);

  if (!parsed.success) {
    await supabase.from("cal_webhook_log").insert({
      event_type: typeof json === "object" && json && "triggerEvent" in json ? String((json as { triggerEvent: unknown }).triggerEvent) : null,
      payload: json,
      signature_valid: true,
      error: `schema:${parsed.error.message.slice(0, 240)}`,
    });
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { triggerEvent, payload } = parsed.data;

  const row = {
    cal_booking_id: payload.uid,
    attendee_name: payload.attendees[0]?.name ?? "Unknown",
    attendee_email: payload.attendees[0]?.email ?? "unknown@unknown",
    attendee_phone: extractPhone(payload),
    scheduled_at: new Date(payload.startTime).toISOString(),
    duration_minutes: durationMinutes(payload.startTime, payload.endTime),
    status: statusFromTrigger(triggerEvent),
    raw_payload: parsed.data,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("bookings").upsert(row, { onConflict: "cal_booking_id" });

  if (error) {
    await supabase.from("cal_webhook_log").insert({
      event_type: triggerEvent,
      payload: parsed.data,
      signature_valid: true,
      error: `db:${error.message.slice(0, 240)}`,
    });
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  await supabase.from("cal_webhook_log").insert({
    event_type: triggerEvent,
    payload: parsed.data,
    signature_valid: true,
  });

  return NextResponse.json({ ok: true });
}

function safeParse(s: string): unknown {
  try { return JSON.parse(s); } catch { return null; }
}
```

- [ ] **Step 2: Write integration test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";

const upsertMock = vi.fn().mockResolvedValue({ error: null });
const insertMock = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    from: (table: string) => {
      if (table === "bookings") return { upsert: upsertMock };
      if (table === "cal_webhook_log") return { insert: insertMock };
      throw new Error("unknown table");
    },
  }),
}));

process.env.CAL_WEBHOOK_SECRET = "test-secret-123";

import { POST } from "./route";

const validPayload = {
  triggerEvent: "BOOKING_CREATED",
  payload: {
    uid: "abc-123",
    startTime: "2026-06-01T10:00:00.000Z",
    endTime: "2026-06-01T10:30:00.000Z",
    attendees: [{ name: "Иван Иванов", email: "ivan@example.com" }],
    responses: { phone: "+359888123456" },
  },
};

function sign(body: string) {
  return crypto.createHmac("sha256", "test-secret-123").update(body).digest("hex");
}

function makeRequest(body: string, signature: string | null) {
  const headers = new Headers();
  if (signature !== null) headers.set("x-cal-signature-256", signature);
  return new Request("https://example.com/api/webhooks/cal", {
    method: "POST",
    headers,
    body,
  });
}

describe("POST /api/webhooks/cal", () => {
  beforeEach(() => {
    upsertMock.mockClear();
    insertMock.mockClear();
  });

  it("upserts booking on valid signature + payload", async () => {
    const body = JSON.stringify(validPayload);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledOnce();
    const arg = upsertMock.mock.calls[0][0];
    expect(arg.cal_booking_id).toBe("abc-123");
    expect(arg.attendee_email).toBe("ivan@example.com");
    expect(arg.attendee_phone).toBe("+359888123456");
    expect(arg.duration_minutes).toBe(30);
  });

  it("returns 401 on invalid signature", async () => {
    const body = JSON.stringify(validPayload);
    const res = await POST(makeRequest(body, "deadbeef"));
    expect(res.status).toBe(401);
    expect(upsertMock).not.toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalledOnce();
  });

  it("returns 400 on schema-invalid payload", async () => {
    const body = JSON.stringify({ foo: "bar" });
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("returns 401 when signature header missing", async () => {
    const body = JSON.stringify(validPayload);
    const res = await POST(makeRequest(body, null));
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: all tests pass (vitest will pick up both `verify-webhook` and `route` tests).

- [ ] **Step 4: Commit**

```bash
git add app/api/webhooks/cal/route.ts app/api/webhooks/cal/route.test.ts
git commit -m "feat(api): Cal.com webhook with HMAC verify, Zod parse, idempotent upsert"
```

---

### Task 37: Health endpoint

**Files:**
- Create: `prom-marketing/app/api/health/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok", time: new Date().toISOString() });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/health/route.ts
git commit -m "feat(api): add /api/health endpoint"
```

---

## Phase 5 — Admin dashboard

### Task 38: Admin login page

**Files:**
- Create: `prom-marketing/app/admin/login/page.tsx`
- Create: `prom-marketing/components/admin/LoginForm.tsx`

- [ ] **Step 1: Create LoginForm**

```tsx
"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const supabase = createClient();

  const onMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setSending(false);
    if (error) toast.error(error.message);
    else toast.success("Линк за вход е изпратен на имейла ти");
  };

  const onGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/admin` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="w-full max-w-sm space-y-5">
      <h1 className="font-display text-3xl font-bold">Вход</h1>
      {initialError === "forbidden" && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Този имейл няма достъп до администраторския панел.
        </div>
      )}
      <form onSubmit={onMagic} className="space-y-3">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@promarketing.bg"
          className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-deep)] px-4 py-3 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-cyan)]"
        />
        <Button type="submit" disabled={sending} className="w-full">
          {sending ? "Изпращане..." : "Изпрати magic link"}
        </Button>
      </form>
      <div className="relative my-4 text-center text-xs uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
        или
      </div>
      <Button type="button" variant="outline" onClick={onGoogle} className="w-full">
        Влез с Google
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Create login page**

```tsx
import { LoginForm } from "@/components/admin/LoginForm";
import { Toaster } from "@/components/ui/sonner";
import { AuroraBackground } from "@/components/effects/AuroraBackground";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="relative grid min-h-screen place-items-center px-6">
      <AuroraBackground intensity="subtle" />
      <div className="relative z-10 glass rounded-2xl p-10">
        <LoginForm initialError={params.error} />
      </div>
      <Toaster theme="dark" position="top-right" />
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/login/page.tsx components/admin/LoginForm.tsx
git commit -m "feat(admin): add login page with magic link and Google OAuth"
```

---

### Task 39: Admin layout (auth guard) + sign-out

**Files:**
- Create: `prom-marketing/app/admin/layout.tsx`
- Create: `prom-marketing/components/admin/AdminShell.tsx`

- [ ] **Step 1: Create AdminShell**

```tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/landing/Logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Преглед" },
  { href: "/admin/bookings", label: "Срещи" },
  { href: "/admin/settings", label: "Настройки" },
];

export function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const path = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-2 border-r border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/60 p-6 md:flex">
        <Link href="/admin"><Logo /></Link>
        <nav className="mt-8 flex flex-col gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-colors",
                path === l.href
                  ? "bg-[var(--color-accent-cyan)]/10 text-[var(--color-accent-cyan)]"
                  : "text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <p className="mb-2 text-xs text-[var(--color-text-tertiary)]">{email}</p>
          <Button variant="ghost" onClick={signOut} className="w-full justify-start">
            Изход
          </Button>
        </div>
      </aside>
      <main className="md:pl-64">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create layout**

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/admin/login");
  }

  const allowed = (process.env.ALLOWED_ADMIN_EMAILS ?? "")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

  if (!allowed.includes(user.email.toLowerCase())) {
    redirect("/admin/login?error=forbidden");
  }

  return (
    <>
      <AdminShell email={user.email}>{children}</AdminShell>
      <Toaster theme="dark" position="top-right" />
    </>
  );
}
```

- [ ] **Step 3: Skip layout for /admin/login**

Add a `app/admin/login/layout.tsx`:

```tsx
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

Wait — Next.js nests layouts. The `app/admin/layout.tsx` would also apply to `/admin/login`. To avoid that, restructure: move `app/admin/login/` to a sibling route group `app/(auth)/admin/login/page.tsx` OR use a route group at admin level.

**Refactor approach:** wrap admin protected routes in `(protected)` group.

```bash
mkdir -p "app/admin/(protected)"
# move existing app/admin/page.tsx etc. into (protected)/
```

For this task: we have only `app/admin/login/page.tsx` so far. Move our auth check INSIDE the `(protected)` group later, after we create dashboard pages. So skip creating layout.tsx at `app/admin/` for now and put the auth check inside specific pages, OR use the route-group approach.

Cleanest: use route groups.

Rewrite Step 2 as **structure:**

```
app/admin/
  layout.tsx                      ← purely sets <Toaster /> globally; no auth
  login/page.tsx                  ← auth not required
  (protected)/
    layout.tsx                    ← does the auth check + AdminShell
    page.tsx                      ← dashboard
    bookings/page.tsx
    settings/page.tsx
```

- [ ] **Step 4: Implement `app/admin/layout.tsx` (no auth check, just shared chrome)**

```tsx
import { Toaster } from "@/components/ui/sonner";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster theme="dark" position="top-right" />
    </>
  );
}
```

- [ ] **Step 5: Implement `app/admin/(protected)/layout.tsx` (auth check)**

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/admin/login");
  }

  const allowed = (process.env.ALLOWED_ADMIN_EMAILS ?? "")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

  if (!allowed.includes(user.email.toLowerCase())) {
    redirect("/admin/login?error=forbidden");
  }

  return <AdminShell email={user.email}>{children}</AdminShell>;
}
```

- [ ] **Step 6: Commit**

```bash
git add app/admin/layout.tsx "app/admin/(protected)/layout.tsx" components/admin/AdminShell.tsx
git commit -m "feat(admin): add layouts with route-group auth gate and AdminShell nav"
```

---

### Task 40: Admin dashboard page (summary)

**Files:**
- Create: `prom-marketing/app/admin/(protected)/page.tsx`
- Create: `prom-marketing/components/admin/StatsCards.tsx`

- [ ] **Step 1: Create StatsCards**

```tsx
import { Card } from "@/components/ui/card";

interface Stat { label: string; value: string | number; hint?: string; }

export function StatsCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="glass p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">{s.label}</p>
          <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
          {s.hint && <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{s.hint}</p>}
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create dashboard page**

```tsx
import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/admin/StatsCards";
import { format } from "date-fns";
import { bg } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [{ count: weekCount }, { count: monthCount }, { count: upcomingCount }, { data: recent }] =
    await Promise.all([
      supabase.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
      supabase.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", monthAgo.toISOString()),
      supabase.from("bookings").select("*", { count: "exact", head: true }).gte("scheduled_at", now.toISOString()).eq("status", "confirmed"),
      supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(5),
    ]);

  return (
    <div className="p-6 md:p-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold">Преглед</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Снимка на най-новата активност</p>
      </header>

      <StatsCards
        stats={[
          { label: "Седмица", value: weekCount ?? 0, hint: "нови заявки" },
          { label: "Месец", value: monthCount ?? 0, hint: "нови заявки" },
          { label: "Предстоящи", value: upcomingCount ?? 0, hint: "потвърдени" },
          { label: "Общо", value: (recent?.length ?? 0) > 0 ? "active" : "—", hint: "статус" },
        ]}
      />

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold">Последни 5 заявки</h2>
        <div className="glass rounded-xl overflow-hidden">
          <ul className="divide-y divide-[var(--color-border-default)]">
            {(recent ?? []).map((b) => (
              <li key={b.id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{b.attendee_name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{b.attendee_email}</p>
                </div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  {format(new Date(b.scheduled_at), "d MMM yyyy, HH:mm", { locale: bg })}
                </div>
              </li>
            ))}
            {(!recent || recent.length === 0) && (
              <li className="px-5 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
                Все още няма заявки
              </li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/admin/(protected)/page.tsx" components/admin/StatsCards.tsx
git commit -m "feat(admin): add dashboard with stat cards and recent bookings list"
```

---

### Task 41: Admin bookings table

**Files:**
- Create: `prom-marketing/app/admin/(protected)/bookings/page.tsx`
- Create: `prom-marketing/components/admin/BookingsTable.tsx`

- [ ] **Step 1: Create BookingsTable**

```tsx
"use client";
import { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { bg } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export interface BookingRow {
  id: string;
  cal_booking_id: string;
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  created_at: string;
}

export function BookingsTable({ rows }: { rows: BookingRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "scheduled_at", desc: true }]);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      r.attendee_name.toLowerCase().includes(q) ||
      r.attendee_email.toLowerCase().includes(q) ||
      (r.attendee_phone ?? "").toLowerCase().includes(q)
    );
  }, [rows, filter]);

  const columns = useMemo<ColumnDef<BookingRow>[]>(() => [
    {
      accessorKey: "attendee_name",
      header: "Име",
      cell: (info) => (
        <div>
          <p className="font-medium">{info.getValue<string>()}</p>
          <p className="text-xs text-[var(--color-text-tertiary)]">{info.row.original.attendee_email}</p>
        </div>
      ),
    },
    { accessorKey: "attendee_phone", header: "Телефон", cell: (info) => info.getValue() ?? "—" },
    {
      accessorKey: "scheduled_at",
      header: "Час",
      cell: (info) => format(new Date(info.getValue<string>()), "d MMM yyyy, HH:mm", { locale: bg }),
    },
    { accessorKey: "duration_minutes", header: "Мин", cell: (info) => `${info.getValue()}m` },
    {
      accessorKey: "status",
      header: "Статус",
      cell: (info) => {
        const s = info.getValue<string>();
        const tone = s === "confirmed" ? "text-emerald-300" : s === "cancelled" ? "text-red-300" : "text-amber-300";
        return <span className={tone}>{s}</span>;
      },
    },
  ], []);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const exportCSV = () => {
    const header = ["Име", "Имейл", "Телефон", "Час", "Минути", "Статус"];
    const lines = [header.join(",")].concat(
      filtered.map((r) =>
        [r.attendee_name, r.attendee_email, r.attendee_phone ?? "",
         r.scheduled_at, r.duration_minutes, r.status]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
    );
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bookings-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Търси по име, имейл или телефон"
          className="flex-1 min-w-[240px] rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-deep)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent-cyan)]"
        />
        <Button variant="outline" onClick={exportCSV}>Експорт CSV</Button>
      </div>

      <div className="glass overflow-hidden rounded-xl">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} onClick={h.column.getToggleSortingHandler()} className="cursor-pointer select-none">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === "asc" ? " ↑" : h.column.getIsSorted() === "desc" ? " ↓" : ""}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-[var(--color-text-tertiary)]">
                  Няма заявки
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
        <span>
          Страница {table.getState().pagination.pageIndex + 1} от {table.getPageCount() || 1}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Предишна
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Следваща
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create bookings page**

```tsx
import { createClient } from "@/lib/supabase/server";
import { BookingsTable, type BookingRow } from "@/components/admin/BookingsTable";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, cal_booking_id, attendee_name, attendee_email, attendee_phone, scheduled_at, duration_minutes, status, created_at")
    .order("scheduled_at", { ascending: false });

  return (
    <div className="p-6 md:p-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold">Срещи</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Всички заявки от Cal.com webhook</p>
      </header>
      <BookingsTable rows={(data ?? []) as BookingRow[]} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/admin/(protected)/bookings/page.tsx" components/admin/BookingsTable.tsx
git commit -m "feat(admin): add bookings table with search, sort, pagination, CSV export"
```

---

### Task 42: Admin settings page

**Files:**
- Create: `prom-marketing/app/admin/(protected)/settings/page.tsx`

- [ ] **Step 1: Implement**

```tsx
export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://promarketing.bg"}/api/webhooks/cal`;
  const secret = process.env.CAL_WEBHOOK_SECRET ?? "";
  const masked = secret ? `${secret.slice(0, 4)}…${secret.slice(-4)}` : "не е настроен";
  const allowed = (process.env.ALLOWED_ADMIN_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const username = process.env.NEXT_PUBLIC_CAL_USERNAME ?? "";
  const slug = process.env.NEXT_PUBLIC_CAL_EVENT_SLUG ?? "";

  return (
    <div className="space-y-8 p-6 md:p-10">
      <header>
        <h1 className="font-display text-3xl font-bold">Настройки</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Само за преглед — промени се правят чрез env vars и redeploy</p>
      </header>

      <section className="glass space-y-3 rounded-xl p-6">
        <h2 className="font-display text-xl font-bold">Cal.com</h2>
        <Row label="Потребител" value={username || "не е настроен"} />
        <Row label="Event slug" value={slug || "не е настроен"} />
        <Row label="Webhook URL" value={webhookUrl} mono />
        <Row label="Webhook secret" value={masked} mono />
      </section>

      <section className="glass space-y-3 rounded-xl p-6">
        <h2 className="font-display text-xl font-bold">Администратори</h2>
        {allowed.length === 0 && <p className="text-sm text-[var(--color-text-tertiary)]">Няма зададени имейли</p>}
        <ul className="space-y-1 text-sm">
          {allowed.map((e) => <li key={e} className="font-mono">{e}</li>)}
        </ul>
      </section>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[var(--color-border-default)] py-2 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-[var(--color-text-tertiary)]">{label}</span>
      <span className={mono ? "font-mono text-sm break-all" : "text-sm"}>{value}</span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/admin/(protected)/settings/page.tsx"
git commit -m "feat(admin): add read-only settings page (Cal.com config, admins)"
```

---

## Phase 6 — Polish, deployment, tests

### Task 43: Error and not-found pages

**Files:**
- Create: `prom-marketing/app/error.tsx`
- Create: `prom-marketing/app/not-found.tsx`

- [ ] **Step 1: Create error.tsx**

```tsx
"use client";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent-cyan)]">
          // нещо се обърка
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold">Възникна грешка</h1>
        <p className="mt-4 max-w-md text-[var(--color-text-secondary)]">
          Опитай отново. Ако проблемът остане, пиши ни на hello@promarketing.bg.
        </p>
        <Button className="mt-8" onClick={reset}>Опитай отново</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create not-found.tsx**

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent-cyan)]">
          // 404
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold">Страницата не съществува</h1>
        <Button asChild className="mt-8"><Link href="/">Обратно към началото</Link></Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/error.tsx app/not-found.tsx
git commit -m "feat: add global error and 404 pages"
```

---

### Task 44: Playwright smoke tests

**Files:**
- Create: `prom-marketing/tests/e2e/landing.spec.ts`
- Create: `prom-marketing/tests/e2e/admin.spec.ts`

- [ ] **Step 1: Install Playwright browser**

```bash
npm run test:e2e:install
```

- [ ] **Step 2: Create landing test**

```ts
import { test, expect } from "@playwright/test";

test("landing renders hero and main sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("бизнеса си", { timeout: 4000 });
  await expect(page.getByRole("button", { name: /Запази безплатна консултация/ })).toBeVisible();
  await expect(page.locator("#services")).toBeVisible();
  await expect(page.locator("#process")).toBeVisible();
  await expect(page.locator("#industries")).toBeVisible();
  await expect(page.locator("#faq")).toBeVisible();
});

test("clicking Запази среща in navbar attempts to open Cal.com popup", async ({ page }) => {
  await page.goto("/");
  await page.locator("header button", { hasText: "Запази среща" }).click();
  // Cal.com loads via injected iframe — check that it tries to mount
  await expect(page.locator('iframe[src*="cal.com"]').first()).toBeVisible({ timeout: 10_000 });
});

test("navigation anchors scroll to sections", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Услуги" }).click();
  await expect(page).toHaveURL(/#services$/);
});
```

- [ ] **Step 3: Create admin test**

```ts
import { test, expect } from "@playwright/test";

test("unauthenticated /admin redirects to login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "Вход" })).toBeVisible();
});

test("login page renders magic link form", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.getByPlaceholder("email@promarketing.bg")).toBeVisible();
  await expect(page.getByRole("button", { name: /Изпрати magic link/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Влез с Google/ })).toBeVisible();
});
```

- [ ] **Step 4: Run smoke tests**

```bash
npm run test:e2e
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e
git commit -m "test: add Playwright smoke tests for landing and admin"
```

---

### Task 45: README, .env.example, project docs

**Files:**
- Create: `prom-marketing/README.md`
- Create: `prom-marketing/.env.example`

- [ ] **Step 1: Create .env.example**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cal.com
NEXT_PUBLIC_CAL_USERNAME=promarketing
NEXT_PUBLIC_CAL_EVENT_SLUG=consultation
CAL_WEBHOOK_SECRET=

# Admin allow-list (comma-separated)
ALLOWED_ADMIN_EMAILS=

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 2: Create README.md**

````markdown
# ProMarketing LTD

Marketing site + admin dashboard for an AI automation agency.

## Stack
Next.js 15, React 19, TypeScript, Tailwind 4, shadcn/ui, Supabase, Cal.com, Motion, Three.js.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

Visit http://localhost:3000.

## Environment

See `.env.example`. All variables are required for full functionality:
- Supabase project URL + anon + service-role keys.
- Cal.com username + event slug + webhook secret.
- `ALLOWED_ADMIN_EMAILS` — comma-separated list of emails permitted to access `/admin`.

## Database

Migrations live in `supabase/migrations/`. Apply via Supabase Dashboard SQL editor or CLI:

```bash
supabase db push   # if using Supabase CLI linked to your project
```

After migrations, set the Postgres custom config:

```sql
alter database postgres set app.allowed_admin_emails = 'owner@promarketing.bg,other@promarketing.bg';
select pg_reload_conf();
```

## Cal.com setup

1. Sign up at cal.com.
2. Create event "Безплатна консултация" — 30 min.
3. Webhooks → Add → URL `https://<your-domain>/api/webhooks/cal`, secret → copy into `CAL_WEBHOOK_SECRET`.
4. Subscribe to events: `BOOKING_CREATED`, `BOOKING_RESCHEDULED`, `BOOKING_CANCELLED`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build |
| `npm run typecheck` | TS check, no emit |
| `npm test` | Vitest unit + integration |
| `npm run test:e2e` | Playwright smoke tests |

## Deployment

Hosted on Vercel. `main` auto-deploys to production. PRs get preview URLs.
````

- [ ] **Step 3: Commit**

```bash
git add README.md .env.example
git commit -m "docs: add README and .env.example"
```

---

### Task 46: GitHub Actions CI

**Files:**
- Create: `prom-marketing/.github/workflows/ci.yml`

- [ ] **Step 1: Implement**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: http://localhost:0
          NEXT_PUBLIC_SUPABASE_ANON_KEY: dummy
          CAL_WEBHOOK_SECRET: dummy
          ALLOWED_ADMIN_EMAILS: ci@example.com
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for lint, typecheck, vitest, playwright"
```

---

### Task 47: Vercel deployment configuration

**Files:**
- Create: `prom-marketing/vercel.json`

- [ ] **Step 1: Implement**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "headers": [
    {
      "source": "/api/webhooks/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "chore: add Vercel config with security headers"
```

---

### Task 48: Production build verification + deploy

**Files:**
- (no new files; verification only)

- [ ] **Step 1: Production build locally**

```bash
npm run build
```

Expected: build succeeds. Note any warnings; if `useSearchParams` warnings or static-analysis errors appear, fix before proceeding.

- [ ] **Step 2: Start production server**

```bash
npm start
```

Open http://localhost:3000. Verify:
- Hero loads with all effects.
- Section reveals on scroll.
- Cal.com popup opens on CTA click.
- /admin redirects to /admin/login.
- No console errors.

Stop with Ctrl+C.

- [ ] **Step 3: Final commit + tag**

```bash
git tag -a v1.0.0 -m "Initial release of ProMarketing LTD site"
git log --oneline -20
```

- [ ] **Step 4: Push to GitHub remote (when ready)**

User performs this after creating GitHub repo:

```bash
git remote add origin git@github.com:<user>/prom-marketing.git
git push -u origin main --tags
```

- [ ] **Step 5: Deploy to Vercel**

User performs once (or invoke vercel:deploy skill):

```bash
npx vercel link
npx vercel env pull .env.local
npx vercel --prod
```

Set all env vars in Vercel dashboard before first prod deploy.

---

## Self-Review Notes

**Spec coverage:**
- Architecture, routes, page sections, visual design system, animations (all 19), components, data model, booking flow, admin dashboard, performance targets, accessibility, error handling, testing, env vars, external service setup → all mapped to tasks.

**Task-to-spec map (sanity check):**
- Routes → Tasks 21, 30, 38, 39, 40, 41, 42 (landing + admin) + 36, 37 (API).
- Effects (11 components from spec) → Tasks 9–19.
- Innovative animations (19 items) → All implemented across hero, sections, CTAs, and effects.
- Cal.com integration → Tasks 20 (embed), 31 (types), 32 (verify), 36 (webhook).
- Supabase → Tasks 33 (migrations), 34 (clients), 35 (middleware).
- Performance: dynamic-imported ShaderOrb (Task 21), `prefers-reduced-motion` in every effect (Tasks 7+).
- A11y: keyboard nav via shadcn primitives, reduced motion, aria-hidden on decoratives.
- Testing: Vitest for hooks + verify-webhook + webhook route (Tasks 7, 10, 32, 36), Playwright for smoke (Task 44).

**Placeholder scan:** ✓ No TBD/TODO. All code blocks complete. All commit commands present.

**Type consistency:** ✓ `BookingRow` types match across `BookingsTable` and the bookings page. Cal types stay consistent between `lib/cal/types.ts` and `app/api/webhooks/cal/route.ts`.

---

## Open Items (for owner to provide before launch)

- Cal.com `NEXT_PUBLIC_CAL_USERNAME` and `NEXT_PUBLIC_CAL_EVENT_SLUG`.
- Cal.com webhook secret.
- Supabase project URL + anon + service-role keys.
- `ALLOWED_ADMIN_EMAILS`.
- Logo (current is wordmark + conic gradient square; replace if branded logo exists).
- Final copy for hero, FAQ answers (current copy is solid first draft — refine if needed).
- Privacy and Terms page content (currently linked but empty).
