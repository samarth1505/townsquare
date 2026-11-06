import type { ReactNode } from "react";

// One lab section: a heading, a one-line "what this shows", and the live demo in a card.
// (Lab copy is written inline on purpose: it is teaching material, not product text, so it skips messages.ts.)
export default function Section({
  id,
  title,
  summary,
  children,
}: {
  id: string;
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="mb-8"
    >
      <h2
        id={id}
        className="m-0 text-xl font-semibold"
      >
        {title}
      </h2>
      <p className="mt-1 mb-3 text-sm text-app-muted">{summary}</p>
      <div className="rounded-lg border border-app-border bg-app-surface p-4">{children}</div>
    </section>
  );
}
