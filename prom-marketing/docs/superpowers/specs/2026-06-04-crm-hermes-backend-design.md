# CRM Hermes-facing backend — дизайн и план

**Дата:** 2026-06-04
**Обхват на тази фаза:** Backend слоят, от който Hermes автоматизациите имат нужда веднага (Фаза A данни + Фаза C accounting). UI-тата (queue изглед, accounting dashboard, contact tabs, manual-review UI) идват в следващи фази и консумират този слой.

## Защо този ред

Потребителят избра Фаза A (sales follow-up) първа, после поиска „надгради всичко което иска Hermes". Hermes вече върти автоматизации (Gmail→CRM на 15 мин, invoice/payment ledger на 2 ч), затова данните им трябва защитени endpoint-и и таблици, в които да се запишат. Този backend слой е общата основа и за A, и за C.

## Какво вече съществува (надграждаме, не пишем наново)

- `contacts` (stage enum: lead → contacted → discovery → presentation_sent → offer_sent → negotiating → won/lost), `next_followup_at`, `deal_value_eur`, `notes`.
- `contact_activities` (free-text `activity_type`, jsonb `metadata`), realtime включен.
- `upsertContactAndLog()` в `lib/contacts/repository.ts` — вече idempotent чрез `dedupe_key` в metadata.
- Bearer auth pattern с `INTERNAL_SEND_TOKEN` (`/api/admin/contacts`). Това е Hermes patternът.
- Dashboard с overdue/today/pipeline; `ContactDetail.tsx` готов за tabs.

## Решения

### Auth
- Всички `/api/crm/*` приемат `Authorization: Bearer <token>`.
- Приема се `HERMES_API_TOKEN` (ако е зададен) ИЛИ `INTERNAL_SEND_TOKEN` (fallback, който Hermes вече има). timing-safe сравнение. Helper: `lib/crm/auth.ts`.

### Contacts follow-up слой (Фаза A данни)
- Ново поле `contacts.followup_status text` (nullable) + DB CHECK за допустимите стойности:
  `sent_email, sent_presentation, sent_offer, sent_proforma, needs_call, called_waiting_feedback, interested, not_interested, ready_to_close`.
- Ново поле `contacts.last_heard_from_at timestamptz` (nullable) — кога Ivailo последно е „чул" контакта.
- `next_followup_at` се преизползва за „Set next call date" / следващо действие.

**Overdue правило (изискване #7):** контактът е overdue ⇔ `next_followup_at < now()` И (`last_heard_from_at IS NULL` ИЛИ `last_heard_from_at < next_followup_at`). Ако сме го чули след падежа → НЕ е overdue.

**„Изпратено, но не чуто" филтър (#5):** `followup_status` започва с `sent_` И `last_heard_from_at IS NULL`.

### Idempotency (изискване #10 — без двойни notes/activities)
- **Activities:** `dedupe_key` в metadata (съществуващ механизъм).
- **invoices:** unique на `source_email_id` (когато има); иначе unique на `(invoice_number, invoice_type)`. Upsert → `created:false` при дубликат.
- **payments:** unique на `source_email_id` (когато има); иначе dedupe на `(source, payment_reference_redacted, amount, paid_at)`.
- **manual_review_items:** не създава втори OPEN item за същото `(type, related_invoice_id, related_payment_id, related_contact_id)`.
- **recurring_services:** upsert по `(contact_id, service_type)`.

### match-payment — правилото за сигурност (никога paid само по сума)
Чиста функция `evaluatePaymentMatch(signals)`. Сигнали (всеки distinct брои 1):
1. име на клиент/фирма съвпада
2. invoice/proforma номер съвпада
3. точна сума съвпада
4. основание/описание съвпада
5. CRM contact match

- `signalCount >= 3` → confidence `high`; `== 2` → `medium`; `< 2` → `low`.
- **auto-match само при** confidence ∈ {medium, high} **И** няма ambiguity (точно 1 кандидат фактура).
- При auto-match: payment.match_status=`matched`, link invoice; invoice.status = `paid` ако платената сума ≥ amount_gross, иначе `partially_paid`; лог activity `payment_received` (idempotent).
- Иначе (<2 сигнала ИЛИ няколко кандидата) → `manual_review_items` (type `payment_match`/`ambiguous_pdf`), invoice статусът НЕ се пипа.

### Таблици (както в спецификацията)
`invoices`, `payments`, `manual_review_items`, `recurring_services` — пълни колони по заданието. RLS (admin via `is_admin_email`, service role bypass), индекси, `updated_at` тригери (преизползваме `touch_*`), realtime publication.

### Activity types (free text, добавяме етикети/икони)
`invoice`, `proforma_sent`, `payment_received` (има), `payment_matched`, `follow_up_sent`, `followup_status_change`.

## Endpoint-и (всички POST, Bearer, zod, idempotent)
- `POST /api/crm/activity` — find/create contact + лог activity (+ опц. stage/followup_status/next_followup_at/mark_heard/notes/deal_value). Unified Gmail→CRM write.
- `POST /api/crm/invoice`
- `POST /api/crm/payment`
- `POST /api/crm/manual-review`
- `POST /api/crm/recurring-service`
- `POST /api/crm/match-payment`

Всеки връща `{ ok, id, created }` (или решение при match-payment).

## Файлове
- `supabase/migrations/20260604xxxxxx_crm_hermes_backend.sql`
- `lib/crm/auth.ts`, `lib/crm/types.ts`, `lib/crm/repository.ts`, `lib/crm/match.ts` (+ `*.test.ts`)
- `app/api/crm/{activity,invoice,payment,manual-review,recurring-service,match-payment}/route.ts`
- Малки добавки в `lib/contacts/repository.ts` (followup_status / last_heard_from_at / deal_value patch) и `lib/contacts/types.ts` (нови activity етикети, FOLLOWUP_STATUS константи).

## Извън обхвата на тази фаза (следва)
- Фаза A UI: `/admin/follow-up` queue, quick action бутони, daily widget, „sent but not heard" филтър, contact timeline UI.
- Фаза C UI: `/admin/invoices`, `/admin/manual-review`, accounting dashboard, contact detail tabs.
- Фаза B: Google OAuth + Gmail (изисква Google Cloud setup от потребителя).

## Бележки за потребителя (setup)
- Migration трябва да се приложи към Supabase (файлът се създава; прилагането е отделна стъпка с потвърждение).
- Hermes трябва да праща `Authorization: Bearer <INTERNAL_SEND_TOKEN>` (или нов `HERMES_API_TOKEN`).
- Borima Trans: data-level — `recurring_services.excluded_from_auto_send=true`, `active=false` след май 2026 GPS фактура. Историята остава видима.
