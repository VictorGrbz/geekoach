import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-3xl font-semibold">Geekoach</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Suivi de poids, séances et profil — l&apos;habillage JRPG synthwave arrive à l&apos;Étape 3.
        </p>
      </div>

      <nav className="flex flex-col gap-3">
        <Link
          href="/profil"
          className="rounded border border-zinc-200 px-4 py-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          Profil
        </Link>
        <Link
          href="/poids"
          className="rounded border border-zinc-200 px-4 py-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          Suivi de poids
        </Link>
        <Link
          href="/seances"
          className="rounded border border-zinc-200 px-4 py-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          Séances
        </Link>
      </nav>
    </div>
  );
}
