import "server-only";

// Thin wrapper around the Meta Graph API surface we care about for Messenger.
// Keeps version pinning + error formatting in one place. Bumping the version
// here propagates to every caller.

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export interface GraphError {
  message: string;
  type?: string;
  code?: number;
  fbtrace_id?: string;
}

async function graphFetch<T>(
  path: string,
  init: { method?: "GET" | "POST" | "DELETE"; body?: unknown; token?: string }
): Promise<T> {
  const url = new URL(`${GRAPH_BASE}${path}`);
  if (init.token) url.searchParams.set("access_token", init.token);
  const res = await fetch(url.toString(), {
    method: init.method ?? "GET",
    headers: { "content-type": "application/json" },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: GraphError = data?.error ?? { message: `HTTP ${res.status}` };
    throw new Error(`Graph ${path} failed (${err.code ?? res.status}): ${err.message}`);
  }
  return data as T;
}

export interface MessengerSendResult {
  recipient_id: string;
  message_id: string;
}

/** Send a plain text reply via the Page-scoped Send API. */
export async function sendMessengerText({
  pageAccessToken,
  recipientPsid,
  text,
  messagingType = "RESPONSE",
}: {
  pageAccessToken: string;
  recipientPsid: string;
  text: string;
  /** RESPONSE within 24h window; MESSAGE_TAG with a tag for outside that. */
  messagingType?: "RESPONSE" | "UPDATE" | "MESSAGE_TAG";
}): Promise<MessengerSendResult> {
  return graphFetch<MessengerSendResult>(`/me/messages`, {
    method: "POST",
    token: pageAccessToken,
    body: {
      recipient: { id: recipientPsid },
      messaging_type: messagingType,
      message: { text },
    },
  });
}

export interface MessengerUserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  profile_pic?: string;
  locale?: string;
}

/** Fetch what Meta is willing to share about a PSID — usually just name + pic. */
export async function fetchMessengerUserProfile(
  pageAccessToken: string,
  psid: string
): Promise<MessengerUserProfile | null> {
  try {
    return await graphFetch<MessengerUserProfile>(
      `/${psid}?fields=first_name,last_name,profile_pic,locale`,
      { token: pageAccessToken }
    );
  } catch {
    return null;
  }
}

/** Subscribe a Page to receive webhook events (idempotent — Meta handles it). */
export async function subscribePageToApp({
  pageId,
  pageAccessToken,
  fields,
}: {
  pageId: string;
  pageAccessToken: string;
  fields: string[];
}): Promise<{ success: boolean }> {
  return graphFetch<{ success: boolean }>(
    `/${pageId}/subscribed_apps`,
    {
      method: "POST",
      token: pageAccessToken,
      body: { subscribed_fields: fields.join(",") },
    }
  );
}

/** Exchange a short-lived user token + page id for a long-lived Page token. */
export async function exchangeForPageToken(
  pageId: string,
  userAccessToken: string
): Promise<{ access_token: string; expires_in?: number }> {
  return graphFetch<{ access_token: string; expires_in?: number }>(
    `/${pageId}?fields=access_token`,
    { token: userAccessToken }
  );
}
