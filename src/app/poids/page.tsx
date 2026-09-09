import Link from "next/link";
import { listPoids } from "@/db/poids";
import { saveEntreePoids } from "./actions";

export const dynamic = "force-dynamic";

export default async function PoidsPage() {
  const entrees = await listPoids();

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        &larr; Accueil
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Suivi de poids</h1>

      <form action={saveEntreePoids} className="mt-8 flex items-end gap-3">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">Poids (kg)</span>
          <input
            type="number"
            step="0.1"
            name="valeur"
            required
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-black"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        >
          Enregistrer
        </button>
      </form>

      <ul className="mt-8 flex flex-col gap-2">
        {entrees.map((entree) => (
          <li
            key={entree.id}
            className="flex justify-between rounded border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
          >
            <span>{entree.valeur} kg</span>
            <span className="text-zinc-500">{new Date(entree.mesureA).toLocaleString("fr-FR")}</span>
          </li>
        ))}
        {entrees.length === 0 && (
          <li className="text-sm text-zinc-500">Aucune entrée pour le moment.</li>
        )}
      </ul>
    </div>
  );
}
