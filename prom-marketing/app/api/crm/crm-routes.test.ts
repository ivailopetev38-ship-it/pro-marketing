import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.INTERNAL_SEND_TOKEN = "test-token-abcdef";

// Repository is mocked — these route tests cover auth, validation and wiring.
const m = vi.hoisted(() => ({
  recordActivity: vi.fn(),
  upsertInvoice: vi.fn(),
  upsertPayment: vi.fn(),
  createManualReviewItem: vi.fn(),
  upsertRecurringService: vi.fn(),
  matchPayment: vi.fn(),
}));
vi.mock("@/lib/crm/repository", () => m);

import { POST as activityPOST } from "./activity/route";
import { POST as invoicePOST } from "./invoice/route";
import { POST as paymentPOST } from "./payment/route";
import { POST as manualReviewPOST } from "./manual-review/route";
import { POST as recurringPOST } from "./recurring-service/route";
import { POST as matchPOST } from "./match-payment/route";

function req(body: unknown, token: string | null = "test-token-abcdef") {
  const headers = new Headers();
  if (token) headers.set("authorization", `Bearer ${token}`);
  headers.set("content-type", "application/json");
  return new Request("https://example.com/api/crm/x", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  Object.values(m).forEach((fn) => fn.mockReset());
});

describe("auth", () => {
  it("rejects requests without a valid token (403)", async () => {
    const res = await activityPOST(req({ email: "a@b.bg" }, null));
    expect(res.status).toBe(403);
    expect(m.recordActivity).not.toHaveBeenCalled();
  });

  it("rejects a wrong token (403)", async () => {
    const res = await invoicePOST(req({ invoice_number: "F-1" }, "nope"));
    expect(res.status).toBe(403);
  });
});

describe("POST /api/crm/activity", () => {
  it("400 when neither email nor phone is provided", async () => {
    const res = await activityPOST(req({ activity_type: "note", title: "x" }));
    expect(res.status).toBe(400);
  });

  it("records an activity on a valid payload", async () => {
    m.recordActivity.mockResolvedValue({
      contact_id: "c1",
      activity_id: "a1",
      created: true,
      error: null,
    });
    const res = await activityPOST(
      req({ email: "client@firma.bg", activity_type: "email_sent", title: "Имейл", followup_status: "sent_email" })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ ok: true, contact_id: "c1", created: true });
    expect(m.recordActivity).toHaveBeenCalledOnce();
  });
});

describe("POST /api/crm/invoice", () => {
  it("upserts an invoice", async () => {
    m.upsertInvoice.mockResolvedValue({ id: "inv1", created: true, error: null, contact_id: "c1" });
    const res = await invoicePOST(
      req({ client_email: "client@firma.bg", invoice_number: "F-1", amount_gross: 120, source: "gmail_sent" })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, id: "inv1", created: true });
  });
});

describe("POST /api/crm/payment", () => {
  it("400 when amount is missing", async () => {
    const res = await paymentPOST(req({ currency: "BGN" }));
    expect(res.status).toBe(400);
  });

  it("records a payment", async () => {
    m.upsertPayment.mockResolvedValue({ id: "pay1", created: true, error: null });
    const res = await paymentPOST(req({ amount: 120, source: "bank_statement" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, id: "pay1" });
  });
});

describe("POST /api/crm/manual-review", () => {
  it("creates an item", async () => {
    m.createManualReviewItem.mockResolvedValue({ id: "mr1", created: true, error: null });
    const res = await manualReviewPOST(req({ type: "payment_match", title: "Провери" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, id: "mr1" });
  });
});

describe("POST /api/crm/recurring-service", () => {
  it("upserts a recurring service", async () => {
    m.upsertRecurringService.mockResolvedValue({ id: "rs1", created: true, error: null });
    const res = await recurringPOST(
      req({ contact_id: "11111111-1111-4111-8111-111111111111", service_type: "gps", amount: 30 })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, id: "rs1" });
  });
});

describe("POST /api/crm/match-payment", () => {
  it("returns the match decision", async () => {
    m.matchPayment.mockResolvedValue({
      ok: true,
      decision: "auto_match",
      confidence: "high",
      signal_count: 3,
      reasons: ["name", "invoice_number", "exact_amount"],
      blockers: [],
      payment_id: "pay1",
      invoice_id: "inv1",
      invoice_status: "paid",
    });
    const res = await matchPOST(
      req({ payment_id: "22222222-2222-4222-8222-222222222222", invoice_id: "33333333-3333-4333-8333-333333333333", signals: { name_match: true } })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ decision: "auto_match", invoice_status: "paid" });
  });

  it("404 when the payment is not found", async () => {
    m.matchPayment.mockResolvedValue({
      ok: false,
      decision: "manual_review",
      confidence: "low",
      signal_count: 0,
      reasons: [],
      blockers: ["payment_not_found"],
      payment_id: "x",
      error: "payment not found",
    });
    const res = await matchPOST(req({ payment_id: "44444444-4444-4444-8444-444444444444", signals: {} }));
    expect(res.status).toBe(404);
  });
});
