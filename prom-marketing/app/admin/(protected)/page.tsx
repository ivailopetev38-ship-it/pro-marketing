import { createServiceClient } from "@/lib/supabase/service";
import { StatsCards } from "@/components/admin/StatsCards";
import { format } from "date-fns";
import { bg } from "date-fns/locale";

export const dynamic = "force-dynamic";

interface BookingPreview {
  id: string;
  attendee_name: string;
  attendee_email: string;
  scheduled_at: string;
  business: string | null;
  automation_goal: string | null;
  services_interested: string[] | null;
  timeline: string | null;
}

export default async function AdminDashboard() {
  const supabase = createServiceClient();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    { count: weekCount },
    { count: monthCount },
    { count: upcomingCount },
    { count: totalCount },
    { data: recent },
    { data: allForStats },
  ] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
    supabase.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", monthAgo.toISOString()),
    supabase.from("bookings").select("*", { count: "exact", head: true }).gte("scheduled_at", now.toISOString()).eq("status", "confirmed"),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase
      .from("bookings")
      .select("id, attendee_name, attendee_email, scheduled_at, business, automation_goal, services_interested, timeline")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("bookings")
      .select("services_interested, timeline")
      .gte("created_at", monthAgo.toISOString()),
  ]);

  const recentBookings = (recent ?? []) as BookingPreview[];
  const monthRows = (allForStats ?? []) as Pick<BookingPreview, "services_interested" | "timeline">[];

  const serviceCounts = countOccurrences(
    monthRows.flatMap((r) => r.services_interested ?? [])
  );
  const timelineCounts = countOccurrences(
    monthRows.map((r) => r.timeline).filter((v): v is string => Boolean(v))
  );

  return (
    <div className="p-6 md:p-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold">Преглед</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Снимка на най-новата активност и интересите на клиентите
        </p>
      </header>

      <StatsCards
        stats={[
          { label: "Седмица", value: weekCount ?? 0, hint: "нови заявки" },
          { label: "Месец", value: monthCount ?? 0, hint: "нови заявки" },
          { label: "Предстоящи", value: upcomingCount ?? 0, hint: "потвърдени" },
          { label: "Общо", value: totalCount ?? 0, hint: "от стартирането" },
        ]}
      />

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BreakdownCard
          title="Интерес по услуги (последните 30 дни)"
          subtitle="Колко лида искат всяка услуга"
          rows={serviceCounts}
          emptyHint="Все още няма данни"
          accent="cyan"
        />
        <BreakdownCard
          title="Готовност за стартиране"
          subtitle="Кога клиентите искат да започнат"
          rows={timelineCounts}
          emptyHint="Все още няма данни"
          accent="violet"
        />
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold">Последни 5 заявки</h2>
        <div className="glass rounded-xl overflow-hidden">
          <ul className="divide-y divide-[var(--color-border-default)]">
            {recentBookings.map((b) => (
              <li key={b.id} className="flex flex-col gap-2 px-5 py-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{b.attendee_name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{b.attendee_email}</p>
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    {format(new Date(b.scheduled_at), "d MMM yyyy, HH:mm", { locale: bg })}
                  </div>
                </div>
                {b.business && (
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    <span className="text-[var(--color-text-secondary)]">Бизнес:</span> {b.business}
                  </p>
                )}
                {b.automation_goal && (
                  <p className="line-clamp-2 text-xs text-[var(--color-text-tertiary)]">
                    <span className="text-[var(--color-text-secondary)]">Цел:</span> {b.automation_goal}
                  </p>
                )}
                {b.services_interested && b.services_interested.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {b.services_interested.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-[var(--color-accent-cyan)]/10 px-2 py-0.5 text-[10px] text-[var(--color-accent-cyan)]"
                      >
                        {s}
                      </span>
                    ))}
                    {b.timeline && (
                      <span className="rounded-full bg-[var(--color-accent-violet)]/10 px-2 py-0.5 text-[10px] text-[var(--color-accent-violet)]">
                        ⏱ {b.timeline}
                      </span>
                    )}
                  </div>
                )}
              </li>
            ))}
            {recentBookings.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
                Все още няма заявки
              </li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}

function countOccurrences(items: string[]): Array<{ label: string; count: number }> {
  const map = new Map<string, number>();
  for (const it of items) {
    map.set(it, (map.get(it) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

interface BreakdownCardProps {
  title: string;
  subtitle: string;
  rows: Array<{ label: string; count: number }>;
  emptyHint: string;
  accent: "cyan" | "violet";
}

function BreakdownCard({ title, subtitle, rows, emptyHint, accent }: BreakdownCardProps) {
  const max = rows.reduce((m, r) => Math.max(m, r.count), 0);
  const accentColor =
    accent === "cyan" ? "var(--color-accent-cyan)" : "var(--color-accent-violet)";
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{subtitle}</p>
      <ul className="mt-5 space-y-3">
        {rows.length === 0 && (
          <li className="text-sm text-[var(--color-text-tertiary)]">{emptyHint}</li>
        )}
        {rows.map((r) => {
          const pct = max > 0 ? (r.count / max) * 100 : 0;
          return (
            <li key={r.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="truncate pr-3">{r.label}</span>
                <span className="font-mono text-xs text-[var(--color-text-secondary)]">
                  {r.count}
                </span>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: accentColor }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
