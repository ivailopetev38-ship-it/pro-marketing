import { createServiceClient } from "@/lib/supabase/service";
import type { InsightRow } from "@/lib/crm/types";
import { InsightsBoard } from "@/components/admin/InsightsBoard";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const sb = createServiceClient();
  const { data } = await sb.from("insights").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as InsightRow[];

  const open = rows.filter((r) => r.status === "new" || r.status === "in_progress");
  const high = open.filter((r) => r.severity === "high").length;

  return (
    <div className="space-y-6 p-6 md:p-10">
      <header className="cc-panel cc-panel-accent overflow-hidden p-6">
        <p className="hud text-[var(--color-accent-cyan)]">ProMarketing · Командна зала</p>
        <h1 className="cc-title mt-2 font-display text-4xl font-bold">Оптимизация</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {open.length} отворени препоръки{high > 0 ? ` · ${high} с висок приоритет` : ""} · ревизии и насоки за по-добро ИРП.
        </p>
      </header>

      <p className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/40 px-4 py-3 text-xs text-[var(--color-text-secondary)]">
        💡 Тук Хермес Одиторът (нощем) и седмичният AI одит събират какво да се подобри в целия бизнес — подредено по приоритет. Маркирай „В ход" / „Готова", докато работиш по тях.
      </p>

      <InsightsBoard rows={rows} />
    </div>
  );
}
