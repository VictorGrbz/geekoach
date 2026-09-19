"use client";

import Link from "next/link";
import { buttonClass } from "@/components/field";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center gap-4 px-6 py-20 text-center sm:px-10">
      <p className="tracked text-label text-fg-muted">Anomalie sur la carte</p>
      <p className="max-w-sm text-sm text-fg-muted">
        Une erreur inattendue a interrompu la lecture de cette région. Rien n&apos;a été perdu côté carte —
        réessaie, ou reviens à l&apos;accueil.
      </p>
      <div className="mt-2 flex gap-3">
        <button type="button" onClick={reset} className={buttonClass}>
          Réessayer
        </button>
        <Link
          href="/"
          className="tracked text-label border border-line px-5 py-2.5 text-fg-muted transition hover:border-cyan-dim hover:text-cyan"
        >
          Retour à la carte
        </Link>
      </div>
    </div>
  );
}
