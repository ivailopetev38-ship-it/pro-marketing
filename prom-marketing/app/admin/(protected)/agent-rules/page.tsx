import { createServiceClient } from "@/lib/supabase/service";
import type { AgentRuleRow } from "@/lib/crm/types";
import { AgentRulesList } from "@/components/admin/AgentRulesList";

export const dynamic = "force-dynamic";

export default async function AgentRulesPage() {
  const sb = createServiceClient();
  const { data } = await sb.from("agent_rules").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as AgentRuleRow[];
  const active = rows.filter((r) => r.active).length;

  return (
    <div className="space-y-6 p-6 md:p-10">
      <header className="cc-panel cc-panel-accent overflow-hidden p-6">
        <p className="hud text-[var(--color-accent-cyan)]">ProMarketing · Командна зала</p>
        <h1 className="cc-title mt-2 font-display text-4xl font-bold">Правила за работниците</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {active} активни от {rows.length} · уроците, които AI работниците четат всеки цикъл.
        </p>
      </header>

      <p className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/40 px-4 py-3 text-xs text-[var(--color-text-secondary)]">
        💡 Всеки път, щом решиш ръчна проверка с „🎓 Научи Хермес", урокът се появява тук и работникът го прилага от следващия цикъл — повече не пита за същото. Можеш да изключиш правило по всяко време.
      </p>

      <AgentRulesList rows={rows} />
    </div>
  );
}
