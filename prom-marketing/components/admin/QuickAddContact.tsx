"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { CONTACT_STAGES, STAGE_LABEL, type ContactStage } from "@/lib/contacts/types";

// Smart paste parser — accepts a single blob and tries to detect email, phone,
// full name. Examples handled:
//   "Иван Иванов · ivan@x.com · +359888..."
//   "ivan@x.com, +359 888 123 456"
//   "Иван Иванов\n+35988812345"
// Falls back to putting the raw blob into `full_name` if nothing else matches.
function smartParse(blob: string): {
  full_name?: string;
  email?: string;
  phone?: string;
} {
  const trimmed = blob.trim();
  const emailMatch = trimmed.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  const phoneMatch = trimmed.match(/(?:\+?\d[\s-]?){8,}/);
  let remaining = trimmed;
  if (emailMatch) remaining = remaining.replace(emailMatch[0], "");
  if (phoneMatch) remaining = remaining.replace(phoneMatch[0], "");
  remaining = remaining.replace(/[·,;\n]+/g, " ").replace(/\s+/g, " ").trim();
  return {
    full_name: remaining || undefined,
    email: emailMatch?.[0]?.toLowerCase(),
    phone: phoneMatch?.[0]?.replace(/\s+/g, "") || undefined,
  };
}

interface Props {
  /** Pre-fills the inquiry field when opened (e.g. quick-add from a chat). */
  defaultInquiry?: string;
  /** Control open state from parent. If omitted, the component manages its own. */
  open?: boolean;
  onClose?: () => void;
}

export function QuickAddContact({ defaultInquiry, open: openProp, onClose }: Props) {
  const router = useRouter();
  const [innerOpen, setInnerOpen] = useState(false);
  const open = openProp ?? innerOpen;

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [stage, setStage] = useState<ContactStage>("lead");
  const [inquiry, setInquiry] = useState(defaultInquiry ?? "");
  const [smartInput, setSmartInput] = useState("");

  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd/Ctrl + Shift + K opens the dialog from anywhere.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (openProp == null) setInnerOpen(true);
      }
      if (e.key === "Escape" && open) {
        if (onClose) onClose();
        else setInnerOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, openProp, onClose]);

  useEffect(() => {
    if (open) {
      setTimeout(() => firstFieldRef.current?.focus(), 50);
    } else {
      // Reset form on close, deferred to avoid cascading render work in the effect.
      const tick = window.setTimeout(() => {
        setFullName("");
        setEmail("");
        setPhone("");
        setCompany("");
        setStage("lead");
        setInquiry(defaultInquiry ?? "");
        setSmartInput("");
        setErr(null);
        setSavedId(null);
        setBusy(false);
      }, 0);
      return () => window.clearTimeout(tick);
    }
  }, [open, defaultInquiry]);

  const close = () => (onClose ? onClose() : setInnerOpen(false));

  const handleSmartParse = useCallback(() => {
    if (!smartInput.trim()) return;
    const parsed = smartParse(smartInput);
    if (parsed.full_name && !fullName) setFullName(parsed.full_name);
    if (parsed.email && !email) setEmail(parsed.email);
    if (parsed.phone && !phone) setPhone(parsed.phone);
    setSmartInput("");
  }, [smartInput, fullName, email, phone]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);

    if (smartInput.trim()) handleSmartParse();

    if (!fullName.trim() && !email.trim() && !phone.trim()) {
      setErr("Поне едно от полетата (име, имейл или телефон) е задължително.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/admin/contacts/quick", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          company: company.trim() || undefined,
          stage,
          inquiry: inquiry.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Грешка при запис");
        return;
      }
      setSavedId(data.id);
      router.refresh();
      setTimeout(close, 1200);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Грешка";
      setErr(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Floating + button (visible everywhere in admin) */}
      {openProp == null && (
        <button
          type="button"
          onClick={() => setInnerOpen(true)}
          className="fixed bottom-5 right-24 z-[55] flex h-12 items-center gap-2 rounded-full border border-emerald-500/40 bg-gradient-to-br from-emerald-500 to-cyan-500 px-4 text-sm font-bold text-black shadow-[0_8px_30px_-8px_rgba(34,197,94,0.5)] transition hover:scale-105"
          title="Бърз контакт · Ctrl+Shift+K"
        >
          + Контакт
          <kbd className="hidden rounded bg-black/30 px-1.5 py-0.5 font-mono text-[9px] uppercase opacity-70 md:inline">
            ⌘⇧K
          </kbd>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="qa-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
              className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
              aria-hidden
            />
            {/* Dialog */}
            <motion.div
              key="qa-dialog"
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed left-1/2 top-1/2 z-[71] w-[min(560px,calc(100vw-2rem))] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-deep)] shadow-[0_24px_60px_-16px_rgba(0,0,0,0.7)]"
            >
              <form onSubmit={submit}>
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 px-5 py-3">
                  <div>
                    <h2 className="font-display text-lg font-bold">+ Бърз контакт</h2>
                    <p className="text-[11px] text-[var(--color-text-tertiary)]">
                      Лепи цял ред или попълни полетата
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-full p-1.5 text-[var(--color-text-tertiary)] transition hover:bg-white/5 hover:text-[var(--color-text-primary)]"
                    aria-label="Затвори"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4l8 8M4 12l8-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 p-5">
                  {/* Smart paste */}
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
                      🪄 Smart paste — лепи всичко наведнъж
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={smartInput}
                        onChange={(e) => setSmartInput(e.target.value)}
                        onPaste={(e) => {
                          // Auto-parse on paste so the user doesn't need a button
                          setTimeout(() => {
                            const v = (e.target as HTMLInputElement).value;
                            if (v) {
                              const parsed = smartParse(v);
                              if (parsed.full_name) setFullName(parsed.full_name);
                              if (parsed.email) setEmail(parsed.email);
                              if (parsed.phone) setPhone(parsed.phone);
                              setSmartInput("");
                            }
                          }, 30);
                        }}
                        placeholder="напр. Иван Иванов · ivan@gmail.com · +359888..."
                        className="flex-1 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-emerald-500/60"
                      />
                      <button
                        type="button"
                        onClick={handleSmartParse}
                        disabled={!smartInput.trim()}
                        className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 text-sm text-emerald-300 disabled:opacity-40"
                      >
                        Разпознай
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Име">
                      <input
                        ref={firstFieldRef}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Иван Иванов"
                        className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-500/60"
                      />
                    </Field>
                    <Field label="Компания">
                      <input
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="напр. Eco LTD"
                        className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-500/60"
                      />
                    </Field>
                    <Field label="Имейл">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ivan@gmail.com"
                        className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-500/60"
                      />
                    </Field>
                    <Field label="Телефон">
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+359888..."
                        className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-500/60"
                      />
                    </Field>
                  </div>

                  <Field label="Запитване / какво каза">
                    <textarea
                      value={inquiry}
                      onChange={(e) => setInquiry(e.target.value)}
                      rows={2}
                      placeholder={`напр. 'Искам да правя продажби'; или 'Имам ресторант, искам CRM...'`}
                      className="w-full resize-none rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-500/60"
                    />
                  </Field>

                  <Field label="Етап">
                    <div className="flex flex-wrap gap-1.5">
                      {CONTACT_STAGES.filter((s) => s !== "lost").map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStage(s)}
                          className={`rounded-full border px-3 py-1 text-[11px] transition ${
                            stage === s
                              ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-300"
                              : "border-white/10 bg-black/20 text-[var(--color-text-tertiary)] hover:border-cyan-500/30"
                          }`}
                        >
                          {STAGE_LABEL[s]}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {err && (
                    <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                      {err}
                    </p>
                  )}

                  {savedId && (
                    <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                      ✓ Записано. Отвори → /admin/clients/{savedId.slice(0, 8)}...
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-white/5 bg-black/30 px-5 py-3">
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">
                    Натисни <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono">Esc</kbd> за затваряне ·{" "}
                    <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono">⌘⇧K</kbd> отваря отвсякъде
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={close}
                      className="rounded-md border border-white/10 px-3 py-2 text-sm text-[var(--color-text-tertiary)] transition hover:text-[var(--color-text-primary)]"
                    >
                      Отказ
                    </button>
                    <button
                      type="submit"
                      disabled={busy}
                      className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-40"
                    >
                      {busy ? "Запис..." : "Запази контакт"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
        {label}
      </span>
      {children}
    </label>
  );
}
