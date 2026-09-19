import Link from "next/link";
import { getProfil } from "@/db/profil";
import { listPoids } from "@/db/poids";
import { saveEntreePoids, removeEntreePoids } from "./actions";
import { PageHeader } from "@/components/page-header";
import { PoidsChart } from "@/components/poids-chart";
import { DeleteButton } from "@/components/delete-button";
import { Field, buttonClass, inputClass } from "@/components/field";
import { deltaSurFenetre, filtrerParPeriode, moyenneRecente } from "@/lib/stats";
import { getGamificationEtat } from "@/db/gamification";
import { progressionNiveau } from "@/lib/xp";

export const dynamic = "force-dynamic";

const PERIODES = [
  { label: "7 jours", jours: 7 },
  { label: "30 jours", jours: 30 },
  { label: "90 jours", jours: 90 },
  { label: "Tout", jours: null },
] as const;

export default async function PoidsPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const { periode } = await searchParams;
  const periodeJours = periode ? Number(periode) : 90;
  const periodeActive = Number.isFinite(periodeJours) ? periodeJours : null;

  const [profil, entreesDesc, gamificationEtat] = await Promise.all([
    getProfil(),
    listPoids(500),
    getGamificationEtat(),
  ]);
  const entreesAsc = [...entreesDesc].reverse();
  const dernierPoids = entreesAsc.at(-1) ?? null;
  const delta90 = deltaSurFenetre(entreesAsc, 90);
  const moyenne7 = moyenneRecente(entreesAsc, 7);
  const progression = progressionNiveau(gamificationEtat.xpTotal);

  const fenetre = filtrerParPeriode(
    entreesAsc.map((e) => ({ ...e, date: e.mesureA })),
    periodeActive,
  );

  return (
    <div className="min-h-full">
      <PageHeader
        numeral="II"
        title="Poids"
        description="Le tracé se précise à chaque relevé — la ligne pointillée marque l'objectif fixé dans le profil."
        meta={
          <>
            {dernierPoids && `${new Date(dernierPoids.mesureA).toLocaleDateString("fr-FR")} · `}
            Niveau {progression.niveau} ({progression.xpDansNiveau}/{progression.xpRequisNiveau} XP)
          </>
        }
      />

      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-10 sm:px-10">
        {dernierPoids ? (
          <section>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-[family-name:var(--font-display)] text-5xl text-fg">
                {dernierPoids.valeur}
              </span>
              <span className="text-base text-fg-muted">kg</span>
              {delta90 != null && (
                <span className="text-sm text-fg-muted">
                  {delta90 > 0 ? "+" : ""}
                  {delta90.toFixed(1)} kg / 90 jours
                </span>
              )}
            </div>
            {moyenne7 != null && (
              <p className="mt-1 text-xs text-fg-muted">Moyenne 7 jours : {moyenne7.toFixed(1)} kg</p>
            )}

            <div className="mt-6 flex items-center gap-1 border-b border-line pb-4">
              {PERIODES.map((p) => {
                const isActive = p.jours === periodeActive;
                return (
                  <Link
                    key={p.label}
                    href={p.jours === null ? "/poids?periode=all" : `/poids?periode=${p.jours}`}
                    className={`tracked text-label border px-3 py-1.5 transition ${
                      isActive
                        ? "border-cyan-dim text-cyan"
                        : "border-transparent text-fg-muted hover:text-fg"
                    }`}
                  >
                    {p.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 border border-line bg-ink-900/60 px-4 py-4 sm:px-6">
              <PoidsChart
                points={fenetre.map((p) => ({ date: p.mesureA, valeur: p.valeur }))}
                objectif={profil?.poidsObjectif}
                height={260}
              />
            </div>
          </section>
        ) : (
          <p className="text-sm text-fg-muted">
            Aucune pesée relevée pour l&apos;instant. Enregistrez la première ci-dessous.
          </p>
        )}

        <section className="border border-line bg-ink-900/60 px-6 py-6 sm:px-8">
          <h2 className="tracked text-label text-fg-muted">Noter une pesée</h2>
          <form action={saveEntreePoids} className="mt-4 flex flex-wrap items-end gap-4">
            <Field label="Poids (kg)">
              <input
                type="number"
                step="0.1"
                min="1"
                max="500"
                name="valeur"
                required
                className={`${inputClass} w-32`}
              />
            </Field>
            <button type="submit" className={buttonClass}>
              Enregistrer
            </button>
          </form>
        </section>

        <section>
          <h2 className="tracked text-label text-fg-muted">Historique</h2>
          <ul className="mt-3 flex flex-col divide-y divide-line border-y border-line">
            {[...fenetre].reverse().map((e) => (
              <li key={e.id} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                <span className="text-fg">{e.valeur} kg</span>
                <span className="flex items-baseline gap-4">
                  <span className="text-fg-muted">
                    {new Date(e.mesureA).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <form action={removeEntreePoids}>
                    <input type="hidden" name="id" value={e.id} />
                    <DeleteButton confirmMessage={`Supprimer la pesée de ${e.valeur} kg ?`} />
                  </form>
                </span>
              </li>
            ))}
            {fenetre.length === 0 && (
              <li className="py-3 text-sm text-fg-muted">Aucune entrée sur cette période.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
