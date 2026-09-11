import Link from "next/link";
import { getProfil } from "@/db/profil";
import { listPoids } from "@/db/poids";
import { listSeances } from "@/db/seances";
import { listMessages } from "@/db/messages";
import { MistRegion, RegionPanel } from "@/components/region-panel";
import { PoidsChart } from "@/components/poids-chart";
import { buttonClass } from "@/components/field";
import { debutSemaineCourante, deltaSurFenetre, moyenneRecente } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [profil, poids, seances, messages] = await Promise.all([
    getProfil(),
    listPoids(90),
    listSeances(6),
    listMessages(1),
  ]);

  const poidsAsc = [...poids].reverse();
  const dernierPoids = poidsAsc.at(-1) ?? null;
  const delta90 = deltaSurFenetre(poidsAsc, 90);
  const moyenne7 = moyenneRecente(poidsAsc, 7);
  const objectifAtteint =
    profil?.poidsObjectif != null && dernierPoids != null && dernierPoids.valeur <= profil.poidsObjectif;

  const debutSemaine = debutSemaineCourante();
  const seancesCetteSemaine = seances.filter((s) => new Date(s.effectueeA) >= debutSemaine).length;

  const regionsRelevees = [true, poids.length > 0, seances.length > 0, messages.length > 0].filter(
    Boolean,
  ).length;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-10 sm:py-14">
      <header className="mb-10">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-fg sm:text-5xl">
          Carte de Progression
        </h1>
        <p className="mt-3 max-w-lg text-sm text-fg-muted">
          {regionsRelevees} régions relevées sur cinq, le reste sous la brume. La carte se précise à
          mesure que Victor l&apos;explore.
        </p>
      </header>

      <div className="flex flex-col gap-5">
        <RegionPanel numeral="I" title="Profil">
          {profil ? (
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                <div>
                  <p className="tracked text-label-sm text-fg-muted">Objectif</p>
                  <p className="mt-1 text-fg">
                    {profil.poidsObjectif != null ? `${profil.poidsObjectif} kg` : "non défini"}
                    {profil.echeance &&
                      ` · ${new Date(profil.echeance).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`}
                  </p>
                </div>
                <div>
                  <p className="tracked text-label-sm text-fg-muted">Équipement</p>
                  <p className="mt-1 text-fg">
                    {profil.equipement.length > 0 ? profil.equipement.join(", ") : "aucun renseigné"}
                  </p>
                </div>
              </div>
              <Link href="/profil" className="tracked text-label mt-1 text-cyan hover:underline">
                Modifier le profil &rarr;
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-sm text-fg-muted">
              <p>Aucun profil relevé pour l&apos;instant.</p>
              <Link href="/profil" className={`${buttonClass} self-start`}>
                Renseigner le profil
              </Link>
            </div>
          )}
        </RegionPanel>

        {poids.length > 0 && dernierPoids ? (
          <RegionPanel
            numeral="II"
            title="Poids"
            meta={dernierPoids && new Date(dernierPoids.mesureA).toLocaleDateString("fr-FR")}
            sealedNote={
              objectifAtteint
                ? `Objectif ${profil?.poidsObjectif} kg atteint. Nouveau palier à fixer dans le profil.`
                : undefined
            }
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-[family-name:var(--font-display)] text-4xl text-fg">
                {dernierPoids.valeur}
              </span>
              <span className="text-sm text-fg-muted">kg</span>
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
            <div className="mt-4">
              <PoidsChart
                points={poidsAsc.map((p) => ({ date: p.mesureA, valeur: p.valeur }))}
                objectif={profil?.poidsObjectif}
                height={140}
                showAxes={false}
              />
            </div>
            <Link href="/poids" className="tracked text-label mt-4 inline-block text-cyan hover:underline">
              Voir la région entière &rarr;
            </Link>
          </RegionPanel>
        ) : (
          <MistRegion
            numeral="II"
            title="Poids"
            note={
              <>
                Aucune pesée relevée.{" "}
                <Link href="/poids" className="text-cyan hover:underline">
                  Notez un poids
                </Link>{" "}
                pour que le tracé apparaisse.
              </>
            }
          />
        )}

        {seances.length > 0 ? (
          <RegionPanel
            numeral="III"
            title="Séances"
            meta={`${seancesCetteSemaine} cette semaine`}
          >
            <ul className="flex flex-col divide-y divide-line">
              {seances.slice(0, 4).map((s) => (
                <li key={s.id} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                  <span className="text-fg">{s.type}</span>
                  <span className="tracked text-label text-fg-muted">
                    {new Date(s.effectueeA).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} ·{" "}
                    {s.dureeMinutes} min
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/seances" className={`${buttonClass} mt-5 inline-block`}>
              Loguer une séance
            </Link>
          </RegionPanel>
        ) : (
          <MistRegion
            numeral="III"
            title="Séances"
            note={
              <>
                Aucune séance relevée.{" "}
                <Link href="/seances" className="text-cyan hover:underline">
                  Loguez une séance
                </Link>{" "}
                pour que la région se dessine.
              </>
            }
          />
        )}

        <MistRegion
          numeral="IV"
          title="Quêtes"
          note="Pas encore cartographiée — la couche de quêtes arrive à l'Étape 5 du plan."
        />

        {messages.length > 0 ? (
          <RegionPanel numeral="V" title="Coach">
            <p className="tracked text-label-sm text-fg-muted">
              {messages[0].role === "user" ? "Victor" : "Coach"} ·{" "}
              {new Date(messages[0].creeA).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-fg">{messages[0].contenu}</p>
            <Link href="/coach" className="tracked text-label mt-4 inline-block text-cyan hover:underline">
              Voir la région entière &rarr;
            </Link>
          </RegionPanel>
        ) : (
          <RegionPanel numeral="V" title="Coach">
            <div className="flex flex-col gap-3 text-sm text-fg-muted">
              <p>Aucun échange avec le coach pour l&apos;instant.</p>
              <Link href="/coach" className={`${buttonClass} self-start`}>
                Parler au coach
              </Link>
            </div>
          </RegionPanel>
        )}
      </div>
    </div>
  );
}
