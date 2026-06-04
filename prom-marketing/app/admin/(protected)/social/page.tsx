import { createServiceClient } from "@/lib/supabase/service";
import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder";

export const dynamic = "force-dynamic";

const PROVIDER_LABEL: Record<string, string> = {
  facebook_page: "Facebook Page",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  tiktok: "TikTok",
  youtube: "YouTube",
};

const PROVIDER_ICON: Record<string, string> = {
  facebook_page: "👍",
  instagram: "📷",
  linkedin: "💼",
  x: "✖️",
  tiktok: "🎵",
  youtube: "▶️",
};

export default async function SocialPage() {
  const supabase = createServiceClient();
  const [accountsRes, postsRes] = await Promise.all([
    supabase.from("social_accounts").select("id, provider, display_name, status, last_synced_at").order("created_at", { ascending: false }),
    supabase
      .from("social_posts")
      .select("id, provider, caption, status, scheduled_for, published_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const accounts = (accountsRes.data ?? []) as Array<{
    id: string;
    provider: string;
    display_name: string;
    status: string;
    last_synced_at: string | null;
  }>;
  const posts = (postsRes.data ?? []) as Array<{
    id: string;
    provider: string;
    caption: string | null;
    status: string;
    scheduled_for: string | null;
    published_at: string | null;
  }>;

  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;
  const publishedCount = posts.filter((p) => p.status === "published").length;

  return (
    <ModulePlaceholder
      icon="📱"
      title="Социални мрежи"
      description="Управление на акаунти и публикации в социалните мрежи — Facebook, Instagram, LinkedIn, X, TikTok. Композирай веднъж, публикувай в избрани канали едновременно."
      status={
        accounts.some((a) => a.status === "connected")
          ? { label: `${accounts.filter((a) => a.status === "connected").length} канала свързани`, tone: "ready" }
          : { label: "очаква свързване на акаунти", tone: "pending" }
      }
      stats={[
        { label: "Свързани акаунти", value: accounts.filter((a) => a.status === "connected").length, color: "#06b6d4" },
        { label: "Чакащи свързване", value: accounts.filter((a) => a.status !== "connected").length, color: "#facc15" },
        { label: "Планирани постове", value: scheduledCount, color: "#a78bfa" },
        { label: "Публикувани (общо)", value: publishedCount, color: "#22c55e" },
      ]}
      primaryAction={{ label: "+ Свържи акаунт", href: "/admin/social#connect" }}
      secondaryAction={{ label: "+ Нов пост", href: "/admin/social#compose" }}
      features={[
        {
          icon: "🔗",
          title: "Meta Graph API · Facebook & Instagram",
          description: "OAuth flow с Page access tokens. Read + publish + insights. Изисква Meta Business app verification.",
          ready: false,
        },
        {
          icon: "💼",
          title: "LinkedIn · публикации и компании",
          description: "LinkedIn API v2. Лична страница + Company Page. Изисква Marketing Developer Platform достъп.",
          ready: false,
        },
        {
          icon: "📅",
          title: "Календар на постовете",
          description: "Drag-to-schedule view с филтри по канал. Cron job всяка минута публикува зрелите 'scheduled' постове.",
          ready: false,
        },
        {
          icon: "📊",
          title: "Stats per post",
          description: "Reach, likes, comments, shares, clicks — синхронизирани веднъж в час. Виждаш кое работи.",
          ready: false,
        },
        {
          icon: "🤖",
          title: "AI композиране на пост",
          description: "Hermes / Claude генерира варианти по тема + бранд тон. Изпращаш до одобрение преди публикуване.",
          ready: false,
        },
        {
          icon: "📸",
          title: "Media библиотека",
          description: "Изображения и видеа в Supabase Storage. Reuse, tag, search — без качване всеки път.",
          ready: false,
        },
      ]}
    >
      {accounts.length > 0 && (
        <section>
          <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
            Регистрирани акаунти
          </h2>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-deep)]/40 p-3"
              >
                <span className="text-2xl">{PROVIDER_ICON[a.provider] ?? "📱"}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{a.display_name}</p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">
                    {PROVIDER_LABEL[a.provider] ?? a.provider}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider ${
                    a.status === "connected"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-amber-500/15 text-amber-300"
                  }`}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </ModulePlaceholder>
  );
}
