import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import {
  CHANNEL_LABEL,
  CHANNEL_ICON,
  CHANNEL_COLOR,
  type ChatChannel,
} from "@/lib/chatbot/types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  open: "отворен",
  qualified: "квалифициран",
  converted: "клиент",
  abandoned: "изоставен",
  closed: "затворен",
};

export default async function ConversationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: conv } = await supabase
    .from("chatbot_conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!conv) notFound();

  const { data: messages } = await supabase
    .from("chatbot_messages")
    .select("id, role, content, model, tokens_in, tokens_out, latency_ms, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const msgs = (messages ?? []) as Array<{
    id: string;
    role: string;
    content: string;
    model: string | null;
    tokens_in: number | null;
    tokens_out: number | null;
    latency_ms: number | null;
    created_at: string;
  }>;

  // Optional linked contact
  let contact: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    stage: string;
    company: string | null;
  } | null = null;
  if (conv.contact_id) {
    const { data } = await supabase
      .from("contacts")
      .select("id, full_name, email, phone, stage, company")
      .eq("id", conv.contact_id)
      .maybeSingle();
    contact = data ?? null;
  }

  const channel = conv.channel as ChatChannel;
  const startedDate = new Date(conv.started_at);
  const lastDate = new Date(conv.last_message_at);
  const duration = lastDate.getTime() - startedDate.getTime();
  const durationMin = Math.round(duration / 60000);

  return (
    <div className="space-y-6 p-6 md:p-10">
      {/* Breadcrumb */}
      <Link
        href="/admin/chatbots"
        className="inline-flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-cyan)]"
      >
        ← Назад към разговорите
      </Link>

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/40 p-6">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
            style={{ background: `${CHANNEL_COLOR[channel]}25`, color: CHANNEL_COLOR[channel] }}
          >
            {CHANNEL_ICON[channel]}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">
              {conv.visitor_name ?? conv.visitor_email ?? "Анонимен посетител"}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              <span style={{ color: CHANNEL_COLOR[channel] }}>{CHANNEL_LABEL[channel]}</span>
              <span className="text-[var(--color-text-tertiary)]">·</span>
              <span>{startedDate.toLocaleString("bg-BG")}</span>
              <span className="text-[var(--color-text-tertiary)]">·</span>
              <span>{durationMin > 0 ? `${durationMin} мин разговор` : "току що"}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                  conv.status === "qualified" || conv.status === "converted"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                }`}
              >
                {STATUS_LABEL[conv.status] ?? conv.status}
              </span>
              {conv.qualification_score != null && conv.qualification_score > 0 && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                  Score · {conv.qualification_score}/100
                </span>
              )}
              {contact && (
                <Link
                  href={`/admin/clients/${contact.id}`}
                  className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-300 hover:bg-emerald-500/20"
                >
                  → В CRM: {contact.full_name ?? contact.email}
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Съобщения
          </p>
          <p className="mt-1 text-3xl font-bold text-[var(--color-accent-cyan)]">{msgs.length}</p>
        </div>
      </header>

      {/* Two-column layout: thread + metadata */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Message thread */}
        <section className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/40 p-4">
          <h2 className="mb-4 font-display text-base font-semibold">📜 Нишка на разговора</h2>
          {msgs.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[var(--color-border-default)] p-6 text-center text-sm text-[var(--color-text-tertiary)]">
              Няма съобщения в този разговор.
            </p>
          ) : (
            <div className="space-y-3">
              {msgs.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[80%]">
                      <p
                        className={`mb-1 font-mono text-[9px] uppercase tracking-wider ${
                          isUser ? "text-right text-cyan-400" : "text-left text-[var(--color-text-tertiary)]"
                        }`}
                      >
                        {isUser ? "Посетител" : `AI · ${m.model ?? "scripted"}`}
                        {" · "}
                        {new Date(m.created_at).toLocaleString("bg-BG", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                        {m.latency_ms && ` · ${m.latency_ms}ms`}
                      </p>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isUser
                            ? "rounded-br-md bg-cyan-500 text-black"
                            : "rounded-bl-md bg-white/[0.05] text-[var(--color-text-primary)]"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Metadata sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/40 p-5">
            <h3 className="mb-3 font-display text-sm font-semibold">📌 Кой / откъде</h3>
            <dl className="space-y-2 text-sm">
              <Field label="Име">{conv.visitor_name ?? "—"}</Field>
              <Field label="Имейл">{conv.visitor_email ?? "—"}</Field>
              <Field label="Телефон">{conv.visitor_phone ?? "—"}</Field>
              <Field label="Канал">
                <span style={{ color: CHANNEL_COLOR[channel] }}>
                  {CHANNEL_ICON[channel]} {CHANNEL_LABEL[channel]}
                </span>
              </Field>
              <Field label="Тип бот">{conv.scope}</Field>
              {conv.source_url && (
                <Field label="Източник">
                  <a
                    href={conv.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-[var(--color-accent-cyan)] hover:underline"
                  >
                    {conv.source_url}
                  </a>
                </Field>
              )}
            </dl>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/40 p-5">
            <h3 className="mb-3 font-display text-sm font-semibold">📊 Времеви статистики</h3>
            <dl className="space-y-2 text-sm">
              <Field label="Започнат">{startedDate.toLocaleString("bg-BG")}</Field>
              <Field label="Последно съобщение">{lastDate.toLocaleString("bg-BG")}</Field>
              <Field label="Продължителност">
                {durationMin > 0 ? `${durationMin} мин` : "под минута"}
              </Field>
              <Field label="Брой съобщения">{msgs.length}</Field>
            </dl>
          </div>

          {!contact && (conv.visitor_email || conv.visitor_phone) && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
              <h3 className="mb-2 font-display text-sm font-semibold text-amber-300">
                ⚠️ Не е свързан с CRM
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Този разговор има контактни данни, но не е промотиран към CRM. С AI co-pilot:
                „Промотирай разговор {id.slice(0, 8)} към CRM".
              </p>
            </div>
          )}

          {contact && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <h3 className="mb-3 font-display text-sm font-semibold text-emerald-300">
                ✓ Свързан клиент
              </h3>
              <dl className="space-y-1 text-sm">
                <Field label="Име">{contact.full_name ?? "—"}</Field>
                <Field label="Имейл">{contact.email ?? "—"}</Field>
                <Field label="Етап">{contact.stage}</Field>
                {contact.company && <Field label="Компания">{contact.company}</Field>}
              </dl>
              <Link
                href={`/admin/clients/${contact.id}`}
                className="mt-3 inline-block rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
              >
                Виж клиента →
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
        {label}
      </dt>
      <dd className="text-right text-[var(--color-text-primary)]">{children}</dd>
    </div>
  );
}
