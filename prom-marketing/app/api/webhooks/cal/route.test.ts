import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";

const upsertMock = vi.fn().mockResolvedValue({ error: null });
const insertMock = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    from: (table: string) => {
      if (table === "bookings") return { upsert: upsertMock };
      if (table === "cal_webhook_log") return { insert: insertMock };
      throw new Error("unknown table");
    },
  }),
}));

process.env.CAL_WEBHOOK_SECRET = "test-secret-123";

import { POST } from "./route";

const validPayload = {
  triggerEvent: "BOOKING_CREATED",
  payload: {
    uid: "abc-123",
    startTime: "2026-06-01T10:00:00.000Z",
    endTime: "2026-06-01T10:30:00.000Z",
    attendees: [{ name: "Иван Иванов", email: "ivan@example.com" }],
    responses: { phone: "+359888123456" },
  },
};

function sign(body: string) {
  return crypto.createHmac("sha256", "test-secret-123").update(body).digest("hex");
}

function makeRequest(body: string, signature: string | null) {
  const headers = new Headers();
  if (signature !== null) headers.set("x-cal-signature-256", signature);
  return new Request("https://example.com/api/webhooks/cal", {
    method: "POST",
    headers,
    body,
  });
}

describe("POST /api/webhooks/cal", () => {
  beforeEach(() => {
    upsertMock.mockClear();
    insertMock.mockClear();
  });

  it("upserts booking on valid signature + payload", async () => {
    const body = JSON.stringify(validPayload);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledOnce();
    const arg = upsertMock.mock.calls[0][0];
    expect(arg.cal_booking_id).toBe("abc-123");
    expect(arg.attendee_email).toBe("ivan@example.com");
    expect(arg.attendee_phone).toBe("+359888123456");
    expect(arg.duration_minutes).toBe(30);
  });

  it("returns 401 on invalid signature", async () => {
    const body = JSON.stringify(validPayload);
    const res = await POST(makeRequest(body, "deadbeef"));
    expect(res.status).toBe(401);
    expect(upsertMock).not.toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalledOnce();
  });

  it("returns 400 on schema-invalid payload", async () => {
    const body = JSON.stringify({ foo: "bar" });
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("returns 401 when signature header missing", async () => {
    const body = JSON.stringify(validPayload);
    const res = await POST(makeRequest(body, null));
    expect(res.status).toBe(401);
  });

  it("extracts custom booking question answers into typed columns", async () => {
    const payload = {
      triggerEvent: "BOOKING_CREATED",
      payload: {
        uid: "qa-789",
        startTime: "2026-06-02T10:00:00.000Z",
        endTime: "2026-06-02T10:30:00.000Z",
        attendees: [{ name: "Мария", email: "maria@example.com" }],
        responses: {
          phone: "+359888000000",
          business: "Онлайн магазин за козметика",
          automation_goal: "Искам да автоматизирам отговорите в Messenger",
          services_interested: ["AI чат агенти за поддръжка и продажби", "Email / SMS автоматизация"],
          timeline: "До 1 месец",
        },
      },
    };
    const body = JSON.stringify(payload);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    const arg = upsertMock.mock.calls[0][0];
    expect(arg.business).toBe("Онлайн магазин за козметика");
    expect(arg.automation_goal).toBe("Искам да автоматизирам отговорите в Messenger");
    expect(arg.services_interested).toEqual([
      "AI чат агенти за поддръжка и продажби",
      "Email / SMS автоматизация",
    ]);
    expect(arg.timeline).toBe("До 1 месец");
  });

  it("skips unknown trigger events with 200 (no upsert)", async () => {
    const payload = {
      triggerEvent: "MEETING_ENDED",
      payload: {
        uid: "ignore-1",
        startTime: "2026-06-01T10:00:00.000Z",
        endTime: "2026-06-01T10:30:00.000Z",
        attendees: [{ name: "x", email: "x@example.com" }],
      },
    };
    const body = JSON.stringify(payload);
    const res = await POST(makeRequest(body, sign(body)));
    expect(res.status).toBe(200);
    expect(upsertMock).not.toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalledOnce();
  });
});
