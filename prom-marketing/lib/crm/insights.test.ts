import { describe, it, expect, beforeEach, vi } from "vitest";
import { createFakeSupabase, resetFakeIds, type FakeSupabase } from "./fake-supabase";

const h = vi.hoisted(() => ({ fake: null as unknown as FakeSupabase }));
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => h.fake,
}));

import { upsertInsight, setInsightStatus } from "./repository";
import { listInsights } from "./list-read";

beforeEach(() => {
  resetFakeIds();
  h.fake = createFakeSupabase();
});

describe("upsertInsight", () => {
  it("създава препоръка със статус new и подадените полета", async () => {
    const r = await upsertInsight({
      title: "Маржът пада",
      detail: "YTD марж -22% — провери рекламния разход.",
      category: "performance",
      severity: "high",
      source: "claude_weekly",
    });
    expect(r.error).toBeNull();
    expect(r.created).toBe(true);
    const row = h.fake.store.insights[0] as Record<string, unknown>;
    expect(row.title).toBe("Маржът пада");
    expect(row.status).toBe("new");
    expect(row.category).toBe("performance");
    expect(row.severity).toBe("high");
    expect(row.source).toBe("claude_weekly");
  });

  it("е идемпотентна по dedupe_key за отворени препоръки", async () => {
    const input = { title: "Дубъл фактура", category: "accounting" as const, source: "hermes_auditor" as const, dedupe_key: "audit:dup-invoice:308" };
    const first = await upsertInsight(input);
    const second = await upsertInsight(input);
    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(h.fake.store.insights).toHaveLength(1);
  });

  it("логва automation event за следа", async () => {
    await upsertInsight({ title: "X", source: "hermes_auditor" });
    expect(h.fake.store.automation_events).toHaveLength(1);
  });
});

describe("setInsightStatus", () => {
  it("маркира done + resolved_at", async () => {
    await upsertInsight({ title: "X", dedupe_key: "k1" });
    const id = (h.fake.store.insights[0] as { id: string }).id;
    const r = await setInsightStatus({ id, status: "done" });
    expect(r.error).toBeNull();
    const row = h.fake.store.insights[0] as { status: string; resolved_at: string | null };
    expect(row.status).toBe("done");
    expect(row.resolved_at).toBeTruthy();
  });

  it("връщане в in_progress нулира resolved_at", async () => {
    await upsertInsight({ title: "X", dedupe_key: "k2" });
    const id = (h.fake.store.insights[0] as { id: string }).id;
    await setInsightStatus({ id, status: "done" });
    await setInsightStatus({ id, status: "in_progress" });
    const row = h.fake.store.insights[0] as { status: string; resolved_at: string | null };
    expect(row.status).toBe("in_progress");
    expect(row.resolved_at).toBeNull();
  });

  it("грешка при липсваща препоръка", async () => {
    const r = await setInsightStatus({ id: "ghost", status: "done" });
    expect(r.error).toBe("insight not found");
  });
});

describe("listInsights", () => {
  it("филтрира по статус/категория и сортира high→low, после по дата", async () => {
    h.fake = createFakeSupabase({
      insights: [
        { id: "i1", title: "A", category: "sales", severity: "low", status: "new", created_at: "2026-06-01T00:00:00Z" },
        { id: "i2", title: "B", category: "accounting", severity: "high", status: "new", created_at: "2026-06-02T00:00:00Z" },
        { id: "i3", title: "C", category: "sales", severity: "medium", status: "done", created_at: "2026-06-03T00:00:00Z" },
      ],
    });
    const open = await listInsights({ status: ["new", "in_progress"], limit: 50, offset: 0 });
    expect(open.items.map((x) => x.id)).toEqual(["i2", "i1"]); // high преди low
    const sales = await listInsights({ category: ["sales"], limit: 50, offset: 0 });
    expect(sales.items.map((x) => x.id)).toEqual(["i3", "i1"]); // medium преди low

  });
});
