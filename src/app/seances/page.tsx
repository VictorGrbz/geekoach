import Link from "next/link";
import { listSeances } from "@/db/seances";
import { saveSeance, removeSeance } from "./actions";
import { PageHeader } from "@/components/page-header";
import { SeancesChart } from "@/components/seances-chart";
import { DeleteButton } from "@/components/delete-button";
import { Field, buttonClass, inputClass } from "@/components/field";
import { agregerParSemaine, debutSemaineCourante, filtrerParPeriode } from "@/lib/stats";
import { getGamificationEtat } from "@/db/gamification";
import { progressionNiveau } from "@/lib/xp";

export const dynamic = "force-dynamic";

const PERIODES = [
  { label: "4 semaines", jours: 28 },
  { label: "12 semaines", jours: 84 },
  { label: "Tout", jours: null },
] as const;

export default async function SeancesPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const { periode } = await searchParams;
  const periodeJours = periode ? Number(periode) : 84;
  const periodeActive = Number.isFinite(periodeJours) ? periodeJours : null;

  const [seances, gamificationEtat] = await Promise.all([listSeances(500), getGamificationEtat()]);
  const seancesAsc = [...seances].reverse();
  const debutSemaine = debutSemaineCourante();
  const cetteSemaine = seances.filter((s) => new Date(s.effectueeA) >= debutSemaine).length;
  const progression = progressionNiveau(gamificationEtat.xpTotal);

  const fenetre = filtrerParPeriode(
    seancesAsc.map((s) => ({ ...s, date: s.effectueeA })),
    periodeActive,
  );
  const parSemaine = agregerParSemaine(fenetre);

  return (
    <div className="min-h-full">
      <PageHeader
        numeral="III"
        title="Séances"
        description="Chaque séance loguée trace une marque sur la région — la fréquence hebdomadaire se lit d'un coup d'œil."
        meta={`${cetteSemaine} cette semaine · Niveau ${progression.niveau} (${progression.xpDansNiveau}/${progression.xpRequisNiveau} XP)`}
      />

      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-10 sm:px-10">
        {seances.length > 0 ? (
          <section>
            <div className="flex items-center gap-1 border-b border-line pb-4">
              {PERIODES.map((p) => {
                const isActive = p.jours === periodeActive;
                return (
                  <Link
                    key={p.label}
                    href={p.jours === null ? "/seances?periode=all" : `/seances?periode=${p.jours}`}
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
              <SeancesChart points={parSemaine} height={220} />
            </div>
          </section>
        ) : (
          <p className="text-sm text-fg-muted">
            Aucune séance relevée pour l&apos;instant. Enregistrez la première ci-dessous.
          </p>
        )}

        <section className="border border-line bg-ink-900/60 px-6 py-6 sm:px-8">
          <h2 className="tracked text-label text-fg-muted">Loguer une séance</h2>
          <form action={saveSeance} className="mt-4 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                <input
                  type="text"
                  name="type"
                  required
                  placeholder="cardio, renforcement, étirements..."
                  className={inputClass}
                />
              </Field>
              <Field label="Durée (minutes)">
                <input type="number" name="dureeMinutes" min={1} step={1} required className={inputClass} />
              </Field>
            </div>
            <Field label="Exercices (séparés par des virgules)">
              <input
                type="text"
                name="exercices"
                placeholder="pompes, squats, gainage"
                className={inputClass}
              />
            </Field>
            <Field label="Ressenti">
              <input type="text" name="ressenti" className={inputClass} />
            </Field>
            <button type="submit" className={`${buttonClass} self-start`}>
              Enregistrer
            </button>
          </form>
        </section>

        <section>
          <h2 className="tracked text-label text-fg-muted">Historique</h2>
          <ul className="mt-3 flex flex-col divide-y divide-line border-y border-line">
            {[...fenetre].reverse().map((s) => (
              <li key={s.id} className="py-3 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-fg">{s.type}</span>
                  <span className="flex items-baseline gap-4">
                    <span className="tracked text-label text-fg-muted">
                      {new Date(s.effectueeA).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                      })}{" "}
                      · {s.dureeMinutes} min
                    </span>
                    <form action={removeSeance}>
                      <input type="hidden" name="id" value={s.id} />
                      <DeleteButton confirmMessage={`Supprimer la séance "${s.type}" ?`} />
                    </form>
                  </span>
                </div>
                {s.exercices.length > 0 && (
                  <p className="mt-1 text-fg-muted">{s.exercices.join(", ")}</p>
                )}
                {s.ressenti && <p className="mt-1 text-fg-muted">Ressenti : {s.ressenti}</p>}
              </li>
            ))}
            {fenetre.length === 0 && (
              <li className="py-3 text-sm text-fg-muted">Aucune séance sur cette période.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
