import Link from "next/link";
import { listSeances } from "@/db/seances";
import { saveSeance } from "./actions";

export const dynamic = "force-dynamic";

export default async function SeancesPage() {
  const seances = await listSeances();

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        &larr; Accueil
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Séances</h1>

      <form action={saveSeance} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Type</span>
          <input
            type="text"
            name="type"
            required
            placeholder="cardio, renforcement, étirements..."
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-black"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Durée (minutes)</span>
          <input
            type="number"
            name="dureeMinutes"
            required
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-black"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Exercices (séparés par des virgules)</span>
          <input
            type="text"
            name="exercices"
            placeholder="pompes, squats, gainage"
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-black"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Ressenti</span>
          <input
            type="text"
            name="ressenti"
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-black"
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        >
          Enregistrer
        </button>
      </form>

      <ul className="mt-8 flex flex-col gap-2">
        {seances.map((seance) => (
          <li
            key={seance.id}
            className="rounded border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
          >
            <div className="flex justify-between">
              <span className="font-medium">
                {seance.type} — {seance.dureeMinutes} min
              </span>
              <span className="text-zinc-500">{new Date(seance.effectueeA).toLocaleString("fr-FR")}</span>
            </div>
            {seance.exercices.length > 0 && (
              <p className="mt-1 text-zinc-500">{seance.exercices.join(", ")}</p>
            )}
            {seance.ressenti && <p className="mt-1 text-zinc-500">Ressenti : {seance.ressenti}</p>}
          </li>
        ))}
        {seances.length === 0 && (
          <li className="text-sm text-zinc-500">Aucune séance pour le moment.</li>
        )}
      </ul>
    </div>
  );
}
