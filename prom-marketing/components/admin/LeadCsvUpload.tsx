"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LeadCsvUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const upload = async () => {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      toast.error("Избери CSV файл");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("label", label || file.name.replace(/\.csv$/i, ""));
      const res = await fetch("/api/leads/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Грешка");
      } else if (data.inserted > 0) {
        toast.success(`${data.inserted} нови лийда от ${data.fetched} реда`);
        if (inputRef.current) inputRef.current.value = "";
        setLabel("");
        router.refresh();
      } else {
        toast.info(`0 нови (всички ${data.fetched} вече ги има)`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Грешка");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
        Качи CSV ръчно (от Meta Lead Center)
      </h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_auto]">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-deep)] px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-[var(--color-accent-cyan)] file:px-3 file:py-1 file:font-medium file:text-[var(--color-bg-void)]"
        />
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Етикет (опц.)"
          className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-deep)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent-cyan)]"
        />
        <Button onClick={upload} disabled={busy}>
          {busy ? "Качване…" : "Качи"}
        </Button>
      </div>
      <p className="text-xs text-[var(--color-text-tertiary)]">
        В Lead Center → икона за download → CSV. Това поддържа всички текущи лийдове (42+). За автоматизация конфигурирай Google Sheets източник по-горе.
      </p>
    </div>
  );
}
