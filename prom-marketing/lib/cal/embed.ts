"use client";
import { getCalApi } from "@calcom/embed-react";
import { track } from "@/lib/meta/pixel-client";

const USERNAME = process.env.NEXT_PUBLIC_CAL_USERNAME ?? "promarketing";
const SLUG = process.env.NEXT_PUBLIC_CAL_EVENT_SLUG ?? "consultation";

export const CAL_LINK = `${USERNAME}/${SLUG}`;

export async function initCalEmbed() {
  const cal = await getCalApi({ namespace: "consultation" });
  cal("ui", {
    theme: "dark",
    cssVarsPerTheme: {
      light: {
        "cal-brand": "#06b6d4",
        "cal-bg-emphasis": "#0a0a1f",
        "cal-bg": "#030308",
        "cal-text": "#f5f7ff",
      },
      dark: {
        "cal-brand": "#06b6d4",
        "cal-bg-emphasis": "#0a0a1f",
        "cal-bg": "#030308",
        "cal-text": "#f5f7ff",
      },
    },
    hideEventTypeDetails: false,
  });
  return cal;
}

export async function openBookingPopup() {
  // Fire Meta Lead + InitiateCheckout the moment intent is shown.
  track("Lead", {
    params: { content_name: "Cal.com booking popup", content_category: "consultation" },
  });
  track("InitiateCheckout", {
    params: { content_name: "Cal.com booking popup", content_category: "consultation" },
  });
  const cal = await initCalEmbed();
  cal("modal", { calLink: CAL_LINK });
}
