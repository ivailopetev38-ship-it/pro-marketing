import { describe, it, expect, beforeEach, vi } from "vitest";
import { createFakeSupabase, resetFakeIds, type FakeSupabase } from "./fake-supabase";

const h = vi.hoisted(() => ({ fake: null as unknown as FakeSupabase }));
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => h.fake,
}));

import { createAgentRule, setAgentRuleActive } from "./repository";
import { listAgentRules } from "./list-read";

beforeEach(() => {
  resetFakeIds();
  h.fake = createFakeSupabase();
});

describe("createAgentRule", () => {
  it("създава активно правило с подадените полета", async () => {
    const r = await createAgentRule({
      scope: "postalion",
      title: "Спам подател VEED",
      rule: "Подател *@insights.veed.io → IGNORE, не ескалирай.",
      trigger_pattern: "@insights.veed.io",
      source_review_type: "email_parse_error",
    });
    expect(r.error).toBeNull();
    expect(r.created).toBe(true);
    const row = h.fake.store.agent_rules[0] as Record<string, unknown>;
    expect(row.scope).toBe("postalion");
    expect(row.active).toBe(true);
    expect(row.rule).toContain("IGNORE");
  });

  it("логва automation event за следа", async () => {
    await createAgentRule({ scope: "all", title: "X", rule: "Y" });
    expect(h.fake.store.automation_events).toHaveLength(1);
  });
});

describe("setAgentRuleActive", () => {
  it("изключва правило", async () => {
    await createAgentRule({ scope: "sales", title: "X", rule: "Y" });
    const id = (h.fake.store.agent_rules[0] as { id: string }).id;
    const r = await setAgentRuleActive({ id, active: false });
    expect(r.error).toBeNull();
    expect((h.fake.store.agent_rules[0] as { active: boolean }).active).toBe(false);
  });

  it("грешка при липсващо правило", async () => {
    const r = await setAgentRuleActive({ id: "ghost", active: false });
    expect(r.error).toBe("rule not found");
  });
});

describe("listAgentRules", () => {
  it("филтрира по scope (вкл. 'all') и active", async () => {
    h.fake = createFakeSupabase({
      agent_rules: [
        { id: "r1", scope: "postalion", title: "A", rule: "a", active: true, created_at: "2026-06-01T00:00:00Z" },
        { id: "r2", scope: "all", title: "B", rule: "b", active: true, created_at: "2026-06-02T00:00:00Z" },
        { id: "r3", scope: "sales", title: "C", rule: "c", active: true, created_at: "2026-06-03T00:00:00Z" },
        { id: "r4", scope: "postalion", title: "D", rule: "d", active: false, created_at: "2026-06-04T00:00:00Z" },
      ],
    });
    // Пощальонът пита за своите активни → вижда postalion + all (не sales, не изключените)
    const forPostalion = await listAgentRules({ scope: "postalion", active: true, limit: 50, offset: 0 });
    expect(forPostalion.items.map((x) => x.id).sort()).toEqual(["r1", "r2"]);
  });

  it("без scope връща всички (за управление в UI)", async () => {
    h.fake = createFakeSupabase({
      agent_rules: [
        { id: "r1", scope: "postalion", title: "A", rule: "a", active: true, created_at: "2026-06-01T00:00:00Z" },
        { id: "r2", scope: "sales", title: "B", rule: "b", active: false, created_at: "2026-06-02T00:00:00Z" },
      ],
    });
    const all = await listAgentRules({ limit: 50, offset: 0 });
    expect(all.total).toBe(2);
  });
});
