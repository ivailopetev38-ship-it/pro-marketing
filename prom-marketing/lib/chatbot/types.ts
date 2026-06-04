import { z } from "zod";

export const CHAT_SCOPES = ["site_chatbot", "sales_bot", "support_bot"] as const;
export type ChatScope = (typeof CHAT_SCOPES)[number];

export const chatMessageRoleSchema = z.enum(["user", "assistant", "system", "tool"]);
export type ChatMessageRole = z.infer<typeof chatMessageRoleSchema>;

// Body of a request to /api/chatbot/message. `sessionId` is a random ID the
// widget generates on first message and keeps in localStorage; the server
// upserts a `chatbot_conversations` row keyed on it.
export const CHAT_CHANNELS = [
  "website",
  "instagram_dm",
  "facebook_messenger",
  "whatsapp",
  "telegram",
  "viber",
  "sms",
  "other",
] as const;
export type ChatChannel = (typeof CHAT_CHANNELS)[number];

export const CHANNEL_LABEL: Record<ChatChannel, string> = {
  website: "Уебсайт",
  instagram_dm: "Instagram DM",
  facebook_messenger: "FB Messenger",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  viber: "Viber",
  sms: "SMS",
  other: "Друго",
};

export const CHANNEL_ICON: Record<ChatChannel, string> = {
  website: "🌐",
  instagram_dm: "📷",
  facebook_messenger: "💬",
  whatsapp: "💚",
  telegram: "✈️",
  viber: "🟣",
  sms: "📱",
  other: "🔗",
};

export const CHANNEL_COLOR: Record<ChatChannel, string> = {
  website: "#06b6d4",
  instagram_dm: "#E4405F",
  facebook_messenger: "#1877F2",
  whatsapp: "#25D366",
  telegram: "#26A5E4",
  viber: "#7360F2",
  sms: "#a78bfa",
  other: "#64748b",
};

export const chatRequestSchema = z.object({
  sessionId: z.string().min(8).max(64),
  scope: z.enum(CHAT_SCOPES).default("site_chatbot"),
  channel: z.enum(CHAT_CHANNELS).default("website"),
  message: z.string().min(1).max(4000),
  visitor: z
    .object({
      name: z.string().max(120).optional(),
      email: z.email().optional(),
      phone: z.string().max(40).optional(),
    })
    .optional(),
  sourceUrl: z.string().url().optional(),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const chatReplySchema = z.object({
  reply: z.string(),
  qualified: z.boolean(),
  /** Suggested quick-reply chips (e.g. "Кажи цените", "Запиши среща"). */
  suggestions: z.array(z.string()).max(4).default([]),
  /** When the bot decided it needs identity, surfaces the missing fields. */
  collect: z.array(z.enum(["name", "email", "phone"])).default([]),
  /** Free-form metadata for the widget (e.g. "open_booking_modal"). */
  action: z
    .enum(["none", "open_booking", "open_contact_form", "show_pricing"])
    .default("none"),
});
export type ChatReply = z.infer<typeof chatReplySchema>;
