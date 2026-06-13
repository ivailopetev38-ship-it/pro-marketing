-- ─────────────────────────────────────────────────────────────────────────
-- Табло „Оптимизация / Препоръки" — едно място, където ревизиите и насоките
-- за подобрение на цялото ИРП се събират със статус.
--
-- Кой пише тук: Hermes Одиторът (нощем, вкл. от имейла), седмичният облачен
-- одит на Claude, и ръчно. Собственикът отваря компютъра → намира свежите
-- препоръки готови и подредени по приоритет.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  detail text,
  category text not null default 'other'
    check (category in ('sales', 'accounting', 'data_quality', 'delivery', 'workers', 'performance', 'marketing', 'other')),
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  status text not null default 'new' check (status in ('new', 'in_progress', 'done', 'dismissed')),
  source text not null default 'manual' check (source in ('hermes_auditor', 'claude_weekly', 'manual')),
  impact text,                         -- оценен ефект (свободен текст, по желание)
  related_contact_id uuid references public.contacts(id) on delete set null,
  dedupe_key text,                     -- да не спами една и съща находка
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- Една ОТВОРЕНА препоръка на логическа находка (повторният одит не дублира).
create unique index if not exists insights_open_dedupe_key
  on public.insights (dedupe_key) where dedupe_key is not null and status in ('new', 'in_progress');
create index if not exists insights_status_idx on public.insights (status, severity, created_at desc);
create index if not exists insights_source_idx on public.insights (source, created_at desc);

drop trigger if exists insights_set_updated_at on public.insights;
create trigger insights_set_updated_at before update on public.insights
  for each row execute function public.set_updated_at();

alter table public.insights enable row level security;
