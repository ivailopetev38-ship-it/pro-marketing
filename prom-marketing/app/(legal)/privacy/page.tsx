export const metadata = { title: "Политика за поверителност — ProMarketing LTD" };

export default function PrivacyPage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1 className="font-display text-4xl font-bold">Политика за поверителност</h1>
      <p className="mt-4 text-sm text-[var(--color-text-tertiary)]">Последно обновяване: предстои</p>
      <p className="mt-6 text-[var(--color-text-secondary)]">
        Тази страница ще съдържа пълната политика за поверителност на ProMarketing LTD.
        За въпроси относно обработката на лични данни моля свържете се с нас на{" "}
        <a className="text-[var(--color-accent-cyan)]" href="mailto:hello@promarketing.bg">
          hello@promarketing.bg
        </a>
        .
      </p>
    </article>
  );
}
