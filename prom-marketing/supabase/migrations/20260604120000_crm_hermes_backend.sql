-- ─────────────────────────────────────────────────────────────────────────
-- CRM Hermes-facing backend: sales follow-up layer + accounting cockpit.
--
-- Adds:
--   • contacts.followup_status + contacts.last_heard_from_at  (sales follow-up)
--   • recurring_services   (GPS/CRM/etc. recurring billing, exclusion flags)
--   • invoices             (invoices, proformas, credit notes, GPS fees…)
--   • payments             (bank-statement / payment-email evidence)
--   • manual_review_items  (anything Hermes is not confident about)
--
-- All write paths go through service-role API routes (/api/crm/*). RLS mirrors
-- the contacts model: authenticated admins via is_admin_email(), service role
-- bypasses. Idempotency is enforced with partial unique indexes (dedupe_key +
-- natural keys) so Hermes retries never create duplicates.
-- ─────────────────────────────────────────────────────────────────────────

-- ── 1. contacts: sales follow-up columns ──────────────────────────────────
alter table public.contacts add column if not exists followup_status text;
alter table public.contacts add column if not exists last_heard_from_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'contacts_followup_status_check') then
    alter table public.contacts add constraint contacts_followup_status_check
      check (followup_status is null or followup_status in (
        'sent_email', 'sent_presentation', 'sent_offer', 'sent_proforma',
        'needs_call', 'called_waiting_feedback', 'interested', 'not_interested',
        'ready_to_close'
      ));
  end if;
end$$;

create index if not exists contacts_followup_status_idx on public.contacts (followup_status);
create index if not exists contacts_last_heard_idx on public.contacts (last_heard_from_at);

-- ── 2. generic updated_at trigger function ─────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end$$;

-- ── 3. recurring_services (created first; invoices references it) ───────────
create table if not exists public.recurring_services (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  service_type text not null
    check (service_type in ('gps', 'crm', 'automation', 'hosting', 'maintenance', 'ads', 'other')),
  amount numeric(12, 2),
  currency text not null default 'BGN',
  billing_period text not null default 'monthly'
    check (billing_period in ('monthly', 'yearly', 'one_time')),
  billing_day int check (billing_day is null or (billing_day between 1 and 31)),
  active boolean not null default true,
  excluded_from_auto_send boolean not null default false,
  excluded_reason text,
  started_at date,
  ended_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One recurring service of a given type per contact → idempotent upsert key.
create unique index if not exists recurring_services_contact_type_key
  on public.recurring_services (contact_id, service_type);
create index if not exists recurring_services_active_idx on public.recurring_services (active);

-- ── 4. invoices ────────────────────────────────────────────────────────────
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete set null,
  client_name text,
  client_email text,
  invoice_number text,
  invoice_type text not null default 'invoice'
    check (invoice_type in ('invoice', 'proforma', 'credit_note', 'gps_fee', 'demo_fee', 'service_fee', 'other')),
  issue_date date,
  due_date date,
  amount_net numeric(12, 2),
  amount_gross numeric(12, 2),
  vat_amount numeric(12, 2),
  currency text not null default 'BGN',
  service_type text,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'awaiting_payment', 'partially_paid', 'paid', 'overdue', 'cancelled', 'disputed', 'excluded')),
  source text not null default 'manual'
    check (source in ('manual', 'gmail_sent', 'accountant_email', 'hermes', 'uploaded_pdf')),
  source_email_id text,
  source_pdf_name text,
  recurring_service_id uuid references public.recurring_services(id) on delete set null,
  notes text,
  dedupe_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Idempotency: same Gmail message, same numbered invoice, or same caller key
-- can never create two rows.
create unique index if not exists invoices_source_email_id_key
  on public.invoices (source_email_id) where source_email_id is not null;
create unique index if not exists invoices_number_type_key
  on public.invoices (invoice_number, invoice_type) where invoice_number is not null;
create unique index if not exists invoices_dedupe_key_key
  on public.invoices (dedupe_key) where dedupe_key is not null;

create index if not exists invoices_contact_idx on public.invoices (contact_id);
create index if not exists invoices_status_idx on public.invoices (status);
create index if not exists invoices_due_date_idx on public.invoices (due_date);
create index if not exists invoices_client_email_idx on public.invoices (lower(client_email));

-- ── 5. payments ──────────────────────────────────────────────────────────
-- (source_email_id + dedupe_key are additive vs the spec: needed so an
--  email/bank row that Hermes re-reads doesn't post the same payment twice.)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  amount numeric(12, 2) not null,
  currency text not null default 'BGN',
  paid_at timestamptz,
  counterparty_name text,
  payment_reference_redacted text,
  bank_statement_file text,
  match_confidence text check (match_confidence is null or match_confidence in ('low', 'medium', 'high')),
  match_status text not null default 'unmatched'
    check (match_status in ('matched', 'unmatched', 'ambiguous', 'ignored')),
  source text not null default 'manual'
    check (source in ('bank_statement', 'payment_email', 'manual', 'hermes')),
  source_email_id text,
  notes text,
  dedupe_key text,
  created_at timestamptz not null default now()
);

create unique index if not exists payments_source_email_id_key
  on public.payments (source_email_id) where source_email_id is not null;
create unique index if not exists payments_dedupe_key_key
  on public.payments (dedupe_key) where dedupe_key is not null;

create index if not exists payments_contact_idx on public.payments (contact_id);
create index if not exists payments_invoice_idx on public.payments (invoice_id);
create index if not exists payments_match_status_idx on public.payments (match_status);
create index if not exists payments_paid_at_idx on public.payments (paid_at desc);

-- ── 6. manual_review_items ────────────────────────────────────────────────
create table if not exists public.manual_review_items (
  id uuid primary key default gen_random_uuid(),
  type text not null
    check (type in ('invoice_match', 'payment_match', 'missing_contact', 'ambiguous_pdf', 'email_parse_error', 'bank_statement_error', 'duplicate_invoice', 'recurring_billing_issue')),
  title text not null,
  description text,
  related_contact_id uuid references public.contacts(id) on delete set null,
  related_invoice_id uuid references public.invoices(id) on delete set null,
  related_payment_id uuid references public.payments(id) on delete set null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'resolved', 'ignored')),
  dedupe_key text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- No second OPEN item for the same logical issue.
create unique index if not exists manual_review_open_dedupe_key
  on public.manual_review_items (dedupe_key) where dedupe_key is not null and status = 'open';

create index if not exists manual_review_status_idx on public.manual_review_items (status, created_at desc);
create index if not exists manual_review_type_idx on public.manual_review_items (type);

-- ── 7. updated_at triggers ────────────────────────────────────────────────
drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

drop trigger if exists recurring_services_set_updated_at on public.recurring_services;
create trigger recurring_services_set_updated_at
  before update on public.recurring_services
  for each row execute function public.set_updated_at();

-- ── 8. RLS — admins via session, service role bypasses ────────────────────
alter table public.recurring_services enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.manual_review_items enable row level security;

drop policy if exists "admins manage recurring_services" on public.recurring_services;
create policy "admins manage recurring_services" on public.recurring_services
  for all to authenticated
  using (public.is_admin_email((auth.jwt() ->> 'email')::text))
  with check (public.is_admin_email((auth.jwt() ->> 'email')::text));

drop policy if exists "admins manage invoices" on public.invoices;
create policy "admins manage invoices" on public.invoices
  for all to authenticated
  using (public.is_admin_email((auth.jwt() ->> 'email')::text))
  with check (public.is_admin_email((auth.jwt() ->> 'email')::text));

drop policy if exists "admins manage payments" on public.payments;
create policy "admins manage payments" on public.payments
  for all to authenticated
  using (public.is_admin_email((auth.jwt() ->> 'email')::text))
  with check (public.is_admin_email((auth.jwt() ->> 'email')::text));

drop policy if exists "admins manage manual_review_items" on public.manual_review_items;
create policy "admins manage manual_review_items" on public.manual_review_items
  for all to authenticated
  using (public.is_admin_email((auth.jwt() ->> 'email')::text))
  with check (public.is_admin_email((auth.jwt() ->> 'email')::text));

-- ── 9. realtime for live dashboards ───────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'invoices') then
    alter publication supabase_realtime add table public.invoices;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'payments') then
    alter publication supabase_realtime add table public.payments;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'manual_review_items') then
    alter publication supabase_realtime add table public.manual_review_items;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'recurring_services') then
    alter publication supabase_realtime add table public.recurring_services;
  end if;
end$$;
