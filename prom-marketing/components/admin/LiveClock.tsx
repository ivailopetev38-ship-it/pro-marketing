"use client";
// Ticking command-center clock for the dashboard HUD.
import { useEffect, useState } from "react";

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const t = now
    ? now.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";
  return <span className="font-mono text-[11px] tabular-nums text-[var(--color-text-secondary)]">{t}</span>;
}
