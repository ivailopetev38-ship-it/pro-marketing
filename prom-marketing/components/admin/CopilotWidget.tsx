"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Page-aware quick suggestions. These prime the conversation with the kind of
// commands that make sense on each surface — so the user doesn't stare at an
// empty box wondering what to ask.
const PAGE_HINTS: Array<{ match: RegExp; hints: string[] }> = [
  {
    match: /^\/admin\/?$/,
    hints: [
      "Кои клиенти не съм пипал от 7 дни?",
      "Покажи ми приходите за месеца",
      "Какво да правя първо днес?",
    ],
  },
  {
    match: /^\/admin\/clients/,
    hints: [
      "Намери клиенти без followup",
      "Добави нов контакт",
      "Сортирай по стойност на сделка",
    ],
  },
  {
    match: /^\/admin\/bookings/,
    hints: [
      "Кои срещи са следващата седмица?",
      "Подготви ми резюме за следващата среща",
      "Пиши follow-up имейл след срещата",
    ],
  },
  {
    match: /^\/admin\/email/,
    hints: [
      "Напиши welcome имейл за нов клиент",
      "Прати follow-up на просрочени",
      "Шаблон за оферта",
    ],
  },
  {
    match: /^\/admin\/chatbots/,
    hints: [
      "Колко разговора станаха клиенти?",
      "Покажи последните разговори от Instagram",
      "Кои въпроси най-често задават?",
    ],
  },
];

const DEFAULT_HINTS = [
  "Какво да правя първо?",
  "Покажи приоритети",
  "Подготви ми деня",
];

const HISTORY_KEY = "pm_copilot_history_v1";
const OPEN_KEY = "pm_copilot_open_v1";

function pageHints(path: string): string[] {
  for (const p of PAGE_HINTS) {
    if (p.match.test(path)) return p.hints;
  }
  return DEFAULT_HINTS;
}

export function CopilotWidget() {
  const path = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "greet",
      role: "assistant",
      content: `Здравей! Аз съм AI co-pilot на CRM-а. Пиши ми като на колега — 'напиши имейл', 'кои клиенти забравих', 'смени етап', или каквото е нужно. Утре когато Hermes е свързан, ще изпълнявам действията напълно автоматично.`,
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hints = useMemo(() => pageHints(path), [path]);

  // Restore last open state + history (last 10 turns).
  useEffect(() => {
    setOpen(window.localStorage.getItem(OPEN_KEY) === "open");
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as Msg[];
        if (Array.isArray(arr) && arr.length > 0) setMessages(arr);
      }
    } catch {}
  }, []);

  useEffect(() => {
    window.localStorage.setItem(OPEN_KEY, open ? "open" : "closed");
  }, [open]);

  useEffect(() => {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-20)));
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const t = text.trim();
      if (!t || busy) return;
      const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", content: t };
      setMessages((m) => [...m, userMsg]);
      setDraft("");
      setBusy(true);
      try {
        const res = await fetch("/api/admin/copilot", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            message: t,
            context: { page: path },
            history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMessages((m) => [
            ...m,
            { id: `e-${Date.now()}`, role: "assistant", content: data.error ?? "Грешка. Опитай отново." },
          ]);
          return;
        }
        setMessages((m) => [
          ...m,
          { id: `a-${Date.now()}`, role: "assistant", content: String(data.reply ?? "—") },
        ]);
      } catch {
        setMessages((m) => [
          ...m,
          { id: `e-${Date.now()}`, role: "assistant", content: "Грешка във връзката." },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, path]
  );

  const reset = () => {
    setMessages([
      {
        id: "greet",
        role: "assistant",
        content: "Чисто. С какво помагам?",
      },
    ]);
  };

  return (
    <>
      {/* FAB */}
      <button
        type="button"
        aria-label={open ? "Затвори AI co-pilot" : "Отвори AI co-pilot"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full border border-cyan-500/40 bg-gradient-to-br from-cyan-500 to-violet-500 text-2xl text-black shadow-[0_8px_30px_-8px_rgba(6,182,212,0.6)] transition hover:scale-105"
      >
        {open ? "×" : "🤖"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="copilot"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-5 z-[60] flex h-[min(640px,85vh)] w-[min(420px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/95 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.7)] backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/5 bg-gradient-to-r from-cyan-500/15 to-violet-500/15 px-4 py-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-base font-bold text-black">
                🤖
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-bg-deep)] bg-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">AI co-pilot</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-300">
                  готов · scripted · очаква Hermes
                </p>
              </div>
              <button
                type="button"
                onClick={reset}
                title="Изчисти разговор"
                className="rounded-md px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-tertiary)] transition hover:bg-white/5 hover:text-[var(--color-text-primary)]"
              >
                нов
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Затвори"
                className="rounded-full p-1.5 text-[var(--color-text-tertiary)] transition hover:bg-white/5 hover:text-[var(--color-text-primary)]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M4 12l8-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-md bg-cyan-500 text-black"
                        : "rounded-bl-md bg-white/[0.06] text-[var(--color-text-primary)]"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white/[0.06] px-3.5 py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hints */}
            <div className="flex flex-wrap gap-1.5 border-t border-white/5 bg-black/30 px-3 py-2">
              {hints.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => send(h)}
                  disabled={busy}
                  className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-50"
                >
                  {h}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
              className="flex items-center gap-2 border-t border-white/5 bg-black/40 p-3"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Кажи на AI какво да направи..."
                className="flex-1 rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-cyan-500/60"
                disabled={busy}
                maxLength={2000}
              />
              <button
                type="submit"
                disabled={busy || draft.trim().length === 0}
                className="rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-40"
              >
                →
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
