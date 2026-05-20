import { z } from "zod";

// Cal.com sends ~15 different trigger events. We only act on these three; the
// rest are accepted and logged but produce no row in `bookings`.
export const KNOWN_BOOKING_TRIGGERS = [
  "BOOKING_CREATED",
  "BOOKING_RESCHEDULED",
  "BOOKING_CANCELLED",
] as const;
export type KnownBookingTrigger = (typeof KNOWN_BOOKING_TRIGGERS)[number];

const responseValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.object({ value: z.union([z.string(), z.array(z.string())]) }).passthrough(),
]);

export const calBookingSchema = z.object({
  // Accept any trigger string — Cal sends many. We dispatch by enum check later.
  triggerEvent: z.string(),
  payload: z.object({
    uid: z.string(),
    title: z.string().optional(),
    startTime: z.string(),
    endTime: z.string(),
    attendees: z.array(
      z.object({
        name: z.string(),
        email: z.email(),
        timeZone: z.string().optional(),
      })
    ),
    responses: z.record(z.string(), responseValueSchema).optional(),
    status: z.string().optional(),
  }),
  createdAt: z.string().optional(),
});

export type CalBookingPayload = z.infer<typeof calBookingSchema>;

export function isKnownTrigger(t: string): t is KnownBookingTrigger {
  return (KNOWN_BOOKING_TRIGGERS as readonly string[]).includes(t);
}

// Cal serializes custom question answers under `responses.<identifier>`.
// Values can be string, array (multi-select), or wrapped { value: ... }.
function unwrapResponse(raw: unknown): unknown {
  if (raw && typeof raw === "object" && !Array.isArray(raw) && "value" in raw) {
    return (raw as { value: unknown }).value;
  }
  return raw;
}

export function extractString(
  p: CalBookingPayload["payload"],
  key: string
): string | null {
  const v = unwrapResponse(p.responses?.[key]);
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  if (typeof v === "number") return String(v);
  return null;
}

export function extractStringArray(
  p: CalBookingPayload["payload"],
  key: string
): string[] | null {
  const v = unwrapResponse(p.responses?.[key]);
  if (Array.isArray(v) && v.every((x) => typeof x === "string")) return v;
  if (typeof v === "string" && v.trim().length > 0) return [v.trim()];
  return null;
}

export function extractPhone(p: CalBookingPayload["payload"]): string | null {
  return extractString(p, "phone");
}

export function statusFromTrigger(t: string): string {
  if (t === "BOOKING_CANCELLED") return "cancelled";
  if (t === "BOOKING_RESCHEDULED") return "rescheduled";
  return "confirmed";
}

export function durationMinutes(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}
