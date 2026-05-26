#!/usr/bin/env node
// Обновявам контактите с информацията от user-а (2026-05-26).

const TOKEN = "d57f2e068ec50e6ebccc5e98dbf9a9189a2fbaa238b22354036250334a57872e";
const HOST = "https://promarketing.pw";

async function post(body) {
  const r = await fetch(`${HOST}/api/admin/contacts`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ action: "log_activity", ...body }),
  });
  return r.json();
}

const today = "2026-05-26";

// 1. Теодор Лозев — готов клиент, строителство
const r1 = await post({
  email: "lozevteodor@gmail.com",
  full_name: "Теодор Лозев",
  company: "Строителство",
  activity_type: "call",
  title: "Звъня — не вдига",
  body_text: `Лид от ${today}. Готов клиент, строителство, има склад, КСС документи, счетоводство. Иска да види какво можем да представим — как добавяме най-новите функционалности в един дашборд. Всичко да дойде на имейл. Опитах да звънна — не вдига.`,
  stage: "discovery",
  notes: `[${today}] СТРОИТЕЛСТВО — готов клиент, склад + КСС + счетоводство. Иска оферта с най-новите функционалности в един dashboard. Всичко на имейл.`,
});
console.log("Теодор Лозев:", r1);

// 2. Хасан — изпращаме имейл
const r2 = await post({
  email: "xasirosi.eu@gmail.com",
  full_name: "Хасан Ерол Хасан",
  activity_type: "note",
  title: "За изпращане — информация за АИ агенция и услуги",
  body_text: `Лид от ${today}. План: изпращам кратък имейл с информация за АИ агенцията и услугите ни. Преди изпращане → preview → одобрение.`,
  stage: "contacted",
  notes: `[${today}] Подготвя се имейл за АИ услуги.`,
});
console.log("Хасан:", r2);

// 3. Галя Личева — няма интерес
const r3 = await post({
  email: "petya.licheva2002@gmail.com",
  full_name: "Галя Личева",
  activity_type: "call",
  title: "Звъня — няма интерес",
  body_text: `Лид от ${today}. Свърших телефонен разговор — клиентката потвърди, че няма интерес. Маркирана като lost.`,
  stage: "lost",
  notes: `[${today}] Няма интерес (потвърдено по телефон).`,
});
console.log("Галя:", r3);

// 4. Peter Nikolov Petrov — няма интерес
const r4 = await post({
  email: "petar1942pnp@abv.bg",
  full_name: "Peter Nikolov Petrov",
  activity_type: "call",
  title: "Звъня — няма интерес",
  body_text: `Лид от ${today}. Свърших телефонен разговор (0876758905) — клиентът потвърди, че няма интерес. Маркиран като lost.`,
  stage: "lost",
  notes: `[${today}] Няма интерес (потвърдено по телефон).`,
});
console.log("Peter:", r4);
