import { EmailComposer } from "@/components/admin/EmailComposer";

export const dynamic = "force-dynamic";

export default function EmailPage() {
  const from = process.env.EMAIL_FROM ?? "—";
  return (
    <div className="space-y-6 p-6 md:p-10">
      <header>
        <h1 className="font-display text-3xl font-bold">Изпрати имейл</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Праща от <span className="font-mono">{from}</span> · отговорите идват в твоя Gmail
        </p>
      </header>
      <EmailComposer />
    </div>
  );
}
