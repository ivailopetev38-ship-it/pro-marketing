-- ─────────────────────────────────────────────────────────────────────────
-- agent_rules — „уроци" за AI работниците, които те ЧЕТАТ всеки цикъл.
--
-- Учебният цикъл, изваден в UI: когато Ивайло реши ръчна проверка, може да
-- остави урок („този подател е спам → IGNORE"). Урокът се записва тук като
-- машинно правило; Hermes тегли активните правила (GET /api/crm/agent-rule)
-- в началото на всеки цикъл и ги прилага → не ескалира пак същото.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.agent_rules (
  id uuid primary key default gen_random_uuid(),
  scope text not null default 'all'
    check (scope in ('postalion', 'accountant', 'sales', 'ads', 'auditor', 'all')),
  title text not null,
  rule text not null,                  -- инструкцията/урокът (какво да прави)
  trigger_pattern text,                -- по желание: какво я задейства (подател/ключова дума)
  source_review_type text,             -- от кой тип ръчна проверка е възникнал
  source_review_id uuid references public.manual_review_items(id) on delete set null,
  active boolean not null default true,
  created_by text not null default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agent_rules_scope_active_idx on public.agent_rules (scope, active, created_at desc);

drop trigger if exists agent_rules_set_updated_at on public.agent_rules;
create trigger agent_rules_set_updated_at before update on public.agent_rules
  for each row execute function public.set_updated_at();

alter table public.agent_rules enable row level security;
