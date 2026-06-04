// Light heuristic that decides whether the visitor has shown enough intent +
// shared enough identity to be promoted to a CRM lead. Tuned for the site
// chatbot persona; sales/support bots will get their own qualifiers later.

import type { ChatScope } from "./types";

export interface QualifierInput {
  scope: ChatScope;
  message: string;
  /** Total number of user turns so far (including the new one). */
  userTurns: number;
  visitor?: { name?: string; email?: string; phone?: string } | null;
}

export interface QualifierResult {
  qualified: boolean;
  score: number; // 0-100
  reasons: string[];
  collect: Array<"name" | "email" | "phone">;
}

const INTENT_PATTERNS: Array<{ re: RegExp; weight: number; reason: string }> = [
  { re: /\b(цен|оферт|колко|бюджет|пакет)\b/i, weight: 25, reason: "запитване за цена" },
  { re: /\b(среща|консулт|запиши|booking|кога|интерес)\b/i, weight: 30, reason: "иска среща" },
  { re: /\b(crm|автоматизац|агент|hermes)\b/i, weight: 20, reason: "интерес към CRM/автоматизация" },
  { re: /\b(реклам|кампан|meta|facebook|google)\b/i, weight: 15, reason: "интерес към реклами" },
  { re: /\b(чатбот|whatsapp|имейл)\b/i, weight: 15, reason: "интерес към канали" },
  { re: /\b(бизнес|фирма|компани|стартъп|клиент)\b/i, weight: 10, reason: "бизнес контекст" },
];

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /(?:\+?\d[\s-]?){8,}/;

export function qualifyTurn(input: QualifierInput): QualifierResult {
  const reasons: string[] = [];
  let score = 0;

  for (const p of INTENT_PATTERNS) {
    if (p.re.test(input.message)) {
      score += p.weight;
      reasons.push(p.reason);
    }
  }

  // Visitor identity already known → +20 each
  if (input.visitor?.name) {
    score += 15;
    reasons.push("име знаем");
  }
  if (input.visitor?.email) {
    score += 25;
    reasons.push("имейл знаем");
  }
  if (input.visitor?.phone) {
    score += 20;
    reasons.push("телефон знаем");
  }

  // Engagement length — beyond turn 2, the visitor is invested.
  if (input.userTurns >= 3) {
    score += 10;
    reasons.push("3+ съобщения");
  }

  // Inline email/phone in the latest message?
  if (EMAIL_RE.test(input.message)) {
    score += 25;
    reasons.push("имейл в съобщението");
  }
  if (PHONE_RE.test(input.message)) {
    score += 20;
    reasons.push("телефон в съобщението");
  }

  score = Math.min(100, score);

  // Decide what to collect next.
  const collect: QualifierResult["collect"] = [];
  if (!input.visitor?.name) collect.push("name");
  if (!input.visitor?.email) collect.push("email");
  if (!input.visitor?.phone && score >= 60) collect.push("phone");

  return {
    qualified: score >= 60 && (!!input.visitor?.email || EMAIL_RE.test(input.message)),
    score,
    reasons,
    collect,
  };
}

/** Pull an email or phone out of a freeform message — used to auto-fill. */
export function extractIdentity(message: string): { email?: string; phone?: string } {
  const email = message.match(EMAIL_RE)?.[0];
  const phone = message.match(PHONE_RE)?.[0]?.replace(/\s+/g, "");
  return {
    email: email?.toLowerCase(),
    phone: phone && phone.replace(/[^\d+]/g, "").length >= 8 ? phone : undefined,
  };
}
