import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  numeral,
  title,
  description,
  meta,
}: {
  numeral: string;
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="border-b border-line px-6 py-8 sm:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="tracked text-label text-fg-muted transition hover:text-cyan"
          >
            &larr; Retour à la carte
          </Link>
          {meta && <div className="tracked text-label text-fg-muted">{meta}</div>}
        </div>
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-fg sm:text-4xl">
            {numeral} · {title}
          </h1>
          {description && <p className="mt-2 max-w-xl text-sm text-fg-muted">{description}</p>}
        </div>
      </div>
    </header>
  );
}
