"use client";
import posthog from "posthog-js";

/** Lightweight wrapper so components don't import posthog directly. */
export function track(event: string, props?: Record<string, unknown>) {
  try {
    if (typeof window === "undefined") return;
    posthog.capture(event, props);
  } catch {
    /* swallow — analytics must never break the UI */
  }
}
