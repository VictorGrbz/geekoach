import { getProfil } from "@/db/profil";
import { saveProfil } from "./actions";
import { PageHeader } from "@/components/page-header";
import { Field, buttonClass, inputClass } from "@/components/field";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const profil = await getProfil();

  return (
    <div className="min-h-full">
      <PageHeader
        numeral="I"
        title="Profil"
        description="Objectifs, équipement disponible et contraintes de santé — modifiables ici, ou plus tard en langage naturel via le coach."
      />

      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <form action={saveProfil} className="flex flex-col gap-6 border border-line bg-ink-900/60 px-6 py-8 sm:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Poids objectif (kg)">
              <input
                type="number"
                step="0.1"
                name="poidsObjectif"
                defaultValue={profil?.poidsObjectif ?? ""}
                className={inputClass}
              />
            </Field>

            <Field label="Échéance">
              <input
                type="date"
                name="echeance"
                defaultValue={profil?.echeance ? profil.echeance.slice(0, 10) : ""}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Équipement disponible (séparé par des virgules)">
            <input
              type="text"
              name="equipement"
              defaultValue={profil?.equipement.join(", ") ?? ""}
              placeholder="haltères, tapis, aucun"
              className={inputClass}
            />
          </Field>

          <Field label="Contraintes de santé (séparées par des virgules)">
            <input
              type="text"
              name="contraintesSante"
              defaultValue={profil?.contraintesSante.join(", ") ?? ""}
              placeholder="genou fragile, aucune"
              className={inputClass}
            />
          </Field>

          <Field label="Préférences / notes libres">
            <textarea
              name="preferencesNotes"
              rows={4}
              defaultValue={typeof profil?.preferences.notes === "string" ? profil.preferences.notes : ""}
              className={inputClass}
            />
          </Field>

          <button type="submit" className={`${buttonClass} self-start`}>
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
}
