"use client";
import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

const USERNAME = process.env.NEXT_PUBLIC_CAL_USERNAME ?? "promarketing";
const SLUG = process.env.NEXT_PUBLIC_CAL_EVENT_SLUG ?? "consultation";

export function BookingEmbed() {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "booking-inline" });
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
    })();
  }, []);

  return (
    <Cal
      namespace="booking-inline"
      calLink={`${USERNAME}/${SLUG}`}
      style={{ width: "100%", height: "720px", overflow: "scroll" }}
      config={{ layout: "month_view", theme: "dark" }}
    />
  );
}
