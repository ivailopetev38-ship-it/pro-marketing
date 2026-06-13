"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import { upsertInsight, setInsightStatus } from "@/lib/crm/repository";
import {
  INSIGHT_CATEGORIES,
  INSIGHT_STATUSES,
  SEVERITIES,
  type InsightCategory,
  type InsightStatus,
} from "@/lib/crm/types";

function str(v: FormDataEntryValue | null): string | undefined {
  const s = String(v ?? "").trim();
  return s.length > 0 ? s : undefined;
}

function revalidate() {
  revalidatePath("/admin/insights");
  revalidatePath("/admin");
}

/** Ръчно добавяне на препоръка от UI. */
export async function createInsightAction(formData: FormData) {
  await requireAdmin();
  const title = str(formData.get("title"));
  if (!title) throw new Error("Заглавието е задължително");
  const categoryRaw = str(formData.get("category"));
  const category = categoryRaw && INSIGHT_CATEGORIES.includes(categoryRaw as InsightCategory) ? (categoryRaw as InsightCategory) : "other";
  const sevRaw = str(formData.get("severity"));
  const severity = sevRaw && (SEVERITIES as readonly string[]).includes(sevRaw) ? (sevRaw as (typeof SEVERITIES)[number]) : "medium";

  const res = await upsertInsight({
    title,
    detail: str(formData.get("detail")),
    category,
    severity,
    impact: str(formData.get("impact")),
    source: "manual",
  });
  if (res.error) throw new Error(res.error);
  revalidate();
}

/** Смяна на статус от таблото. */
export async function setInsightStatusAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("insight_id"));
  const status = str(formData.get("status"));
  if (!id || !status || !INSIGHT_STATUSES.includes(status as InsightStatus)) throw new Error("Invalid input");
  const res = await setInsightStatus({ id, status: status as InsightStatus });
  if (res.error) throw new Error(res.error);
  revalidate();
}
