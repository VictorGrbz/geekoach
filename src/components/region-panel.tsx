import type { ReactNode } from "react";

export function RegionPanel({
  numeral,
  title,
  meta,
  sealedNote,
  children,
}: {
  numeral: string;
  title: string;
  meta?: ReactNode;
  sealedNote?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border border-line bg-ink-900/60">
      <header className="flex items-baseline justify-between gap-4 border-b border-line px-6 py-4 sm:px-8">
        <h2 className="tracked text-label text-fg-muted">
          {numeral} · {title}
        </h2>
        {meta && <div className="tracked text-label text-fg-muted">{meta}</div>}
      </header>
      <div className="px-6 py-6 sm:px-8">{children}</div>
      {sealedNote && (
        <footer className="flex items-start gap-3 border-t border-line px-6 py-4 text-sm text-fg-muted sm:px-8">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-dim/60 p-0.5">
            <span className="tracked text-label-sm flex h-full w-full items-center justify-center rounded-full border border-dashed border-cyan-dim/50 text-cyan">
              {numeral}
            </span>
          </span>
          <div>
            <p className="tracked text-label text-cyan/90">Région scellée</p>
            <p className="mt-1">{sealedNote}</p>
          </div>
        </footer>
      )}
    </section>
  );
}

export function MistRegion({
  numeral,
  title,
  note,
}: {
  numeral: string;
  title: string;
  note: ReactNode;
}) {
  return (
    <section className="border border-dashed border-line px-6 py-8 text-center sm:px-8">
      <h2 className="tracked text-label text-fg-muted">
        {numeral} · {title}
      </h2>
      <p className="tracked mt-3 text-lg text-fg-muted">Région sous la brume</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">{note}</p>
    </section>
  );
}
