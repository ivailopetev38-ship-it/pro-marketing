"use client";
import posthog from "posthog-js";

declare global {
  interface Window {
    posthog?: typeof posthog;
  }
}

/**
 * Lightweight wrapper so components don't import posthog directly.
 * Prefers window.posthog (set by PostHogProvider) to avoid duplicate
 * bundles each carrying their own singleton.
 */
export function track(event: string, props?: Record<string, unknown>) {
  try {
    if (typeof window === "undefined") return;
    const ph = window.posthog ?? posthog;
    if (!ph || typeof ph.capture !== "function") return;
    ph.capture(event, props);
  } catch {
    /* swallow — analytics must never break the UI */
  }
}
