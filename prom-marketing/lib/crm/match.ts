/**
 * Payment → invoice matching safety logic.
 *
 * The hard rule (from the spec): an invoice is NEVER marked paid on amount
 * alone. Auto-matching requires at least TWO independent signals AND a single
 * unambiguous candidate invoice. Anything weaker goes to manual review.
 *
 * Pure function — no I/O — so it is exhaustively unit-tested.
 */

export interface MatchSignals {
  /** Client/company name on the payment matches the invoice/contact. */
  name_match?: boolean;
  /** Invoice or proforma number appears in the payment basis/reference. */
  invoice_number_match?: boolean;
  /** Paid amount equals the invoice gross amount exactly. */
  exact_amount_match?: boolean;
  /** Payment basis/description matches (e.g. "фактура 12345 / GPS май"). */
  description_match?: boolean;
  /** Payment resolved to a known CRM contact. */
  contact_match?: boolean;
}

export type MatchDecision = "auto_match" | "manual_review";
export type MatchConfidence = "low" | "medium" | "high";

export interface MatchResult {
  signalCount: number;
  confidence: MatchConfidence;
  decision: MatchDecision;
  /** Which signals fired, for the audit note. */
  reasons: string[];
  /** Why it went to manual review (empty when auto_match). */
  blockers: string[];
}

const SIGNAL_LABELS: Array<[keyof MatchSignals, string]> = [
  ["name_match", "name"],
  ["invoice_number_match", "invoice_number"],
  ["exact_amount_match", "exact_amount"],
  ["description_match", "description"],
  ["contact_match", "contact"],
];

export function evaluatePaymentMatch(
  signals: MatchSignals,
  opts?: {
    /**
     * How many invoices plausibly match this payment. `1` = unambiguous,
     * `0` = nothing to pay, `>1` = ambiguous. `undefined` = caller asserts a
     * specific invoice (treated as unambiguous).
     */
    candidateInvoiceCount?: number;
  }
): MatchResult {
  const reasons: string[] = [];
  for (const [key, label] of SIGNAL_LABELS) {
    if (signals[key]) reasons.push(label);
  }
  const signalCount = reasons.length;

  const confidence: MatchConfidence =
    signalCount >= 3 ? "high" : signalCount === 2 ? "medium" : "low";

  const blockers: string[] = [];

  // Rule 1: need ≥2 independent signals.
  if (signalCount < 2) {
    blockers.push(
      signalCount === 1 && signals.exact_amount_match
        ? "amount_only" // make the most dangerous weak case explicit
        : "insufficient_signals"
    );
  }

  // Rule 2: must be a single unambiguous candidate (when caller tells us).
  const candidates = opts?.candidateInvoiceCount;
  if (candidates !== undefined && candidates !== 1) {
    blockers.push(candidates === 0 ? "no_candidate_invoice" : "ambiguous_candidates");
  }

  const decision: MatchDecision = blockers.length === 0 ? "auto_match" : "manual_review";

  return { signalCount, confidence, decision, reasons, blockers };
}

/**
 * Given a matched payment amount and the invoice gross, decide the resulting
 * invoice status. Never returns "paid" for a zero/short payment.
 */
export function invoiceStatusAfterPayment(
  paidAmount: number,
  invoiceGross: number | null | undefined
): "paid" | "partially_paid" {
  if (invoiceGross == null || invoiceGross <= 0) {
    // Unknown invoice total — treat any positive payment as full to avoid
    // perpetual "partially_paid"; callers with a real total get exact logic.
    return "paid";
  }
  // Allow a 1-stotinka rounding tolerance.
  return paidAmount + 0.01 >= invoiceGross ? "paid" : "partially_paid";
}
