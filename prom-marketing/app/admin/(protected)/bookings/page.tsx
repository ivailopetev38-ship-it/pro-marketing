import { createClient } from "@/lib/supabase/server";
import { BookingsTable, type BookingRow } from "@/components/admin/BookingsTable";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, cal_booking_id, attendee_name, attendee_email, attendee_phone, scheduled_at, duration_minutes, status, created_at")
    .order("scheduled_at", { ascending: false });

  return (
    <div className="p-6 md:p-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold">Срещи</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Всички заявки от Cal.com webhook</p>
      </header>
      <BookingsTable rows={(data ?? []) as BookingRow[]} />
    </div>
  );
}
