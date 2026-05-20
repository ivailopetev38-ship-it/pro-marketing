export const metadata = { title: "Условия за ползване — ProMarketing LTD" };

export default function TermsPage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1 className="font-display text-4xl font-bold">Условия за ползване</h1>
      <p className="mt-4 text-sm text-[var(--color-text-tertiary)]">Последно обновяване: предстои</p>
      <p className="mt-6 text-[var(--color-text-secondary)]">
        Тази страница ще съдържа пълните условия за ползване на ProMarketing LTD.
        За въпроси моля свържете се с нас на{" "}
        <a className="text-[var(--color-accent-cyan)]" href="mailto:hello@promarketing.bg">
          hello@promarketing.bg
        </a>
        .
      </p>
    </article>
  );
}
