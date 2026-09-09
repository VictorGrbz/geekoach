import Link from "next/link";
import { getProfil } from "@/db/profil";
import { saveProfil } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const profil = await getProfil();

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        &larr; Accueil
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Profil</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Objectifs, équipement disponible et contraintes de santé — modifiable ici, ou plus tard en langage naturel via le coach.
      </p>

      <form action={saveProfil} className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Poids objectif (kg)</span>
          <input
            type="number"
            step="0.1"
            name="poidsObjectif"
            defaultValue={profil?.poidsObjectif ?? ""}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-black"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Échéance</span>
          <input
            type="date"
            name="echeance"
            defaultValue={profil?.echeance ? profil.echeance.slice(0, 10) : ""}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-black"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Équipement disponible (séparé par des virgules)</span>
          <input
            type="text"
            name="equipement"
            defaultValue={profil?.equipement.join(", ") ?? ""}
            placeholder="haltères, tapis, aucun"
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-black"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Contraintes de santé (séparées par des virgules)</span>
          <input
            type="text"
            name="contraintesSante"
            defaultValue={profil?.contraintesSante.join(", ") ?? ""}
            placeholder="genou fragile, aucune"
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-black"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Préférences / notes libres</span>
          <textarea
            name="preferencesNotes"
            rows={3}
            defaultValue={typeof profil?.preferences.notes === "string" ? profil.preferences.notes : ""}
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
    </div>
  );
}
