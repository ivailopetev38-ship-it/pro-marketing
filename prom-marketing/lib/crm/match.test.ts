import { describe, it, expect } from "vitest";
import { evaluatePaymentMatch, invoiceStatusAfterPayment } from "./match";

describe("evaluatePaymentMatch", () => {
  it("sends a no-signal payment to manual review", () => {
    const r = evaluatePaymentMatch({});
    expect(r.decision).toBe("manual_review");
    expect(r.confidence).toBe("low");
    expect(r.signalCount).toBe(0);
    expect(r.blockers).toContain("insufficient_signals");
  });

  it("NEVER auto-matches on amount alone", () => {
    const r = evaluatePaymentMatch({ exact_amount_match: true });
    expect(r.decision).toBe("manual_review");
    expect(r.confidence).toBe("low");
    expect(r.blockers).toContain("amount_only");
  });

  it("auto-matches with two signals (name + amount), medium confidence", () => {
    const r = evaluatePaymentMatch(
      { name_match: true, exact_amount_match: true },
      { candidateInvoiceCount: 1 }
    );
    expect(r.decision).toBe("auto_match");
    expect(r.confidence).toBe("medium");
    expect(r.reasons).toEqual(["name", "exact_amount"]);
    expect(r.blockers).toEqual([]);
  });

  it("auto-matches with invoice number + amount", () => {
    const r = evaluatePaymentMatch(
      { invoice_number_match: true, exact_amount_match: true },
      { candidateInvoiceCount: 1 }
    );
    expect(r.decision).toBe("auto_match");
    expect(r.confidence).toBe("medium");
  });

  it("rates three or more signals as high confidence", () => {
    const r = evaluatePaymentMatch(
      { name_match: true, invoice_number_match: true, exact_amount_match: true },
      { candidateInvoiceCount: 1 }
    );
    expect(r.decision).toBe("auto_match");
    expect(r.confidence).toBe("high");
    expect(r.signalCount).toBe(3);
  });

  it("blocks ambiguous candidates even with strong signals", () => {
    const r = evaluatePaymentMatch(
      { name_match: true, invoice_number_match: true, exact_amount_match: true },
      { candidateInvoiceCount: 2 }
    );
    expect(r.decision).toBe("manual_review");
    expect(r.blockers).toContain("ambiguous_candidates");
  });

  it("blocks when there is no candidate invoice", () => {
    const r = evaluatePaymentMatch(
      { name_match: true, contact_match: true },
      { candidateInvoiceCount: 0 }
    );
    expect(r.decision).toBe("manual_review");
    expect(r.blockers).toContain("no_candidate_invoice");
  });

  it("treats undefined candidate count as caller-asserted single invoice", () => {
    const r = evaluatePaymentMatch({ name_match: true, contact_match: true });
    expect(r.decision).toBe("auto_match");
    expect(r.confidence).toBe("medium");
  });
});

describe("invoiceStatusAfterPayment", () => {
  it("marks paid when amount covers the gross", () => {
    expect(invoiceStatusAfterPayment(120, 120)).toBe("paid");
    expect(invoiceStatusAfterPayment(150, 120)).toBe("paid");
  });

  it("marks partially_paid when short", () => {
    expect(invoiceStatusAfterPayment(50, 120)).toBe("partially_paid");
  });

  it("tolerates a 1-stotinka rounding difference", () => {
    expect(invoiceStatusAfterPayment(119.99, 120)).toBe("paid");
  });

  it("treats positive payment as paid when invoice total is unknown", () => {
    expect(invoiceStatusAfterPayment(120, null)).toBe("paid");
    expect(invoiceStatusAfterPayment(120, 0)).toBe("paid");
  });
});
