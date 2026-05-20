-- Add columns for Cal.com booking question answers (extracted for stats).
-- Cal.com identifiers: business, automation_goal, services_interested, timeline.

alter table public.bookings
  add column if not exists business text,
  add column if not exists automation_goal text,
  add column if not exists services_interested jsonb,
  add column if not exists timeline text;

create index if not exists bookings_timeline_idx on public.bookings (timeline);
create index if not exists bookings_services_interested_gin
  on public.bookings using gin (services_interested);
