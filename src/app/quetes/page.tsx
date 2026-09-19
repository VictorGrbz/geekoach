import { PageHeader } from "@/components/page-header";
import { XpBar } from "@/components/xp-bar";
import { QueteRow } from "@/components/quete-row";
import { ArcPanel } from "@/components/arc-panel";
import { AchievementRow } from "@/components/achievement-row";
import { getGamificationEtat } from "@/db/gamification";
import { listQuetesActives } from "@/db/quetes";
import { getArcActif } from "@/db/arcs";
import { listAchievementsDebloques } from "@/db/achievements";
import { listXpEvenements } from "@/db/xp-evenements";
import { progressionNiveau } from "@/lib/xp";
import { trouverTemplateParId } from "@/lib/quetes-catalogue";
import { ACHIEVEMENTS } from "@/lib/achievements-catalogue";
import { semaineCouranteArc } from "@/lib/arcs";

export const dynamic = "force-dynamic";

export default async function QuetesPage() {
  const [etat, quetes, arc, achievementsDebloques, xpEvenements] = await Promise.all([
    getGamificationEtat(),
    listQuetesActives(),
    getArcActif(),
    listAchievementsDebloques(),
    listXpEvenements(15),
  ]);

  const progression = progressionNiveau(etat.xpTotal);
  const debloquesSet = new Set(achievementsDebloques.map((a) => a.code));

  const queteJour = quetes.find((q) => q.portee === "jour");
  const queteSemaine = quetes.find((q) => q.portee === "semaine");
  const queteBoss = quetes.find((q) => q.portee === "boss");

  const lignesQuetes = [
    queteJour && { instance: queteJour, template: trouverTemplateParId(queteJour.templateId) },
    queteSemaine && { instance: queteSemaine, template: trouverTemplateParId(queteSemaine.templateId) },
    queteBoss &&
      arc && {
        instance: queteBoss,
        template: { titre: arc.bossTitre, description: arc.bossDescription },
      },
  ].filter((ligne): ligne is NonNullable<typeof ligne> => Boolean(ligne && ligne.template));

  return (
    <div className="min-h-full">
      <PageHeader
        numeral="IV"
        title="Quêtes"
        description="Niveau, streak, quêtes en cours et arc narratif — la couche de progression de la carte."
        meta={`Streak ${etat.streakActuel} j (record ${etat.streakRecord})`}
      />

      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-10 sm:px-10">
        <section className="border border-line bg-ink-900/60 px-6 py-6 sm:px-8">
          <XpBar {...progression} />
        </section>

        <section>
          <h2 className="tracked text-label text-fg-muted">Quêtes en cours</h2>
          {lignesQuetes.length > 0 ? (
            <ul className="mt-3 flex flex-col divide-y divide-line border-y border-line">
              {lignesQuetes.map(({ instance, template }) => (
                <QueteRow
                  key={instance.id}
                  titre={template!.titre}
                  description={template!.description}
                  progression={instance.progression}
                  objectif={instance.objectif}
                  recompenseXp={instance.recompenseXp}
                  completee={instance.statut === "completee"}
                />
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-fg-muted">
              Aucune quête générée pour l&apos;instant — enregistre une séance ou une pesée.
            </p>
          )}
        </section>

        <section className="border border-line bg-ink-900/60 px-6 py-6 sm:px-8">
          <h2 className="tracked text-label text-fg-muted">Arc narratif</h2>
          <div className="mt-4">
            <ArcPanel
              arc={
                arc && arc.statut !== "a_venir" && arc.statut !== "clos"
                  ? {
                      titre: arc.titre,
                      theme: arc.theme,
                      objectifCle: arc.objectifCle,
                      dureeSemaines: arc.dureeSemaines,
                      semaineCourante: semaineCouranteArc(arc.demarreA),
                      statut: arc.statut,
                      bossTitre: arc.bossTitre,
                      bossDescription: arc.bossDescription,
                    }
                  : null
              }
            />
          </div>
        </section>

        <section>
          <h2 className="tracked text-label text-fg-muted">Succès</h2>
          <ul className="mt-3 flex flex-col divide-y divide-line border-y border-line">
            {ACHIEVEMENTS.map((a) => (
              <AchievementRow
                key={a.code}
                titre={a.titre}
                description={a.description}
                debloque={debloquesSet.has(a.code)}
              />
            ))}
          </ul>
        </section>

        <section>
          <h2 className="tracked text-label text-fg-muted">Journal de progression</h2>
          <ul className="mt-3 flex flex-col divide-y divide-line border-y border-line">
            {xpEvenements.map((e) => (
              <li key={e.id} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                <span className="text-fg">{e.libelle}</span>
                <span className="tracked text-label-sm text-fg-muted">
                  +{e.montant} XP ·{" "}
                  {new Date(e.survenuA).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                </span>
              </li>
            ))}
            {xpEvenements.length === 0 && (
              <li className="py-3 text-sm text-fg-muted">Aucun événement pour l&apos;instant.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
