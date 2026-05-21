"use client";

/**
 * Client-side helpers for the Meta Pixel.
 *
 * `fbq` is exposed as a global by the snippet injected through MetaPixel.tsx.
 * These wrappers add typing + safe no-ops if the pixel hasn't loaded yet
 * (e.g. during reduced-motion / blocker / ad-block scenarios).
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

export function isPixelReady(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

interface EventOptions {
  /** Send a server-side event id so the Pixel + Conversions API can deduplicate. */
  eventID?: string;
  /** Custom parameters (value, currency, content_name, ...). */
  params?: Record<string, unknown>;
}

/** Generate a stable event_id usable for client + server dedup. */
export function newEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function track(event: string, options?: EventOptions): void {
  if (!isPixelReady()) return;
  const args: unknown[] = ["track", event];
  if (options?.params) args.push(options.params);
  if (options?.eventID) args.push({ eventID: options.eventID });
  window.fbq!(...args);
}

export function trackCustom(event: string, params?: Record<string, unknown>): void {
  if (!isPixelReady()) return;
  window.fbq!("trackCustom", event, params ?? {});
}
