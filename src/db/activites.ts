import { getSql, type SqlClient } from "./index";
import { addSeance, type Seance } from "./seances";
import { addPoids, type EntreePoids } from "./poids";
import { getGamificationEtatPourMaj, upsertGamificationEtat } from "./gamification";
import { addXpEvenement, type XpEvenement } from "./xp-evenements";
import { getProfil } from "./profil";
import { debloquerAchievement, listAchievementsDebloques } from "./achievements";
import { creerQueteSiAbsente, incrementerQuete, getQueteBossActiveParArc } from "./quetes";
import { getArcActif, compterSeancesDepuis, passerEnBoss, cloreArc, activerArcSuivant } from "./arcs";
import {
  appliquerActivite,
  niveauDepuisXp,
  XP_OBJECTIF_POIDS_ATTEINT,
  XP_BOSS,
  type EvenementActivite,
  type ResultatActivite,
} from "@/lib/xp";
import {
  selectionnerQueteQuotidienne,
  selectionnerQueteHebdomadaire,
  evaluerProgressionQuete,
} from "@/lib/quetes-catalogue";
import { evaluerNouveauxAchievements, type AchievementDef } from "@/lib/achievements-catalogue";
import { objectifArcAtteint, dureeArcEcoulee, defiBossReussi } from "@/lib/arcs";

export type ResultatEnregistrement = {
  seance?: Seance;
  poids?: EntreePoids;
  gamification: ResultatActivite;
  questsCompletees: { titre: string; recompenseXp: number }[];
  achievementsDebloques: AchievementDef[];
  arc?: { titre: string; statut: string; bossTitre?: string; bossReussi?: boolean; arcSuivantActive?: boolean };
};

function combiner(resultats: ResultatActivite[]): ResultatActivite {
  const premier = resultats[0];
  const dernier = resultats[resultats.length - 1];
  return {
    etat: dernier.etat,
    xpGagne: resultats.reduce((somme, r) => somme + r.xpGagne, 0),
    niveauAvant: premier.niveauAvant,
    niveauApres: dernier.niveauApres,
    leveledUp: resultats.some((r) => r.leveledUp),
    streakProlongee: premier.streakProlongee,
    streakBrisee: premier.streakBrisee,
  };
}

async function periodesCourantes(sql: SqlClient): Promise<{ jour: string; semaine: string }> {
  const rows = await sql`
    SELECT CURRENT_DATE::text AS jour, date_trunc('week', CURRENT_DATE)::date::text AS semaine
  `;
  return { jour: rows[0].jour as string, semaine: rows[0].semaine as string };
}

const LIBELLES: Record<EvenementActivite["type"], string> = {
  seance: "Séance loguée",
  poids: "Pesée enregistrée",
  objectif_poids: "Objectif de poids atteint",
  quete: "Quête complétée",
  boss: "Boss vaincu",
};

async function appliquerXp(sql: SqlClient, evenement: EvenementActivite): Promise<ResultatActivite> {
  const etatActuel = await getGamificationEtatPourMaj(sql);
  const resultat = appliquerActivite(etatActuel, evenement);
  await upsertGamificationEtat(resultat.etat, sql);
  const source: XpEvenement["source"] = evenement.type === "objectif_poids" ? "poids" : evenement.type;
  await addXpEvenement({ source, montant: resultat.xpGagne, libelle: LIBELLES[evenement.type] }, sql);
  return resultat;
}

async function traiterQuetes(
  sql: SqlClient,
  evenement: EvenementActivite,
  jour: string,
  semaine: string,
): Promise<{ completees: { titre: string; recompenseXp: number }[]; xpResultats: ResultatActivite[] }> {
  const templateJour = selectionnerQueteQuotidienne(new Date(`${jour}T00:00:00Z`));
  const templateSemaine = selectionnerQueteHebdomadaire(new Date(`${semaine}T00:00:00Z`));

  const queteJour = await creerQueteSiAbsente(
    {
      templateId: templateJour.id,
      portee: "jour",
      periodeDebut: jour,
      objectif: templateJour.objectif,
      recompenseXp: templateJour.recompenseXp,
    },
    sql,
  );
  const queteSemaine = await creerQueteSiAbsente(
    {
      templateId: templateSemaine.id,
      portee: "semaine",
      periodeDebut: semaine,
      objectif: templateSemaine.objectif,
      recompenseXp: templateSemaine.recompenseXp,
    },
    sql,
  );

  const completees: { titre: string; recompenseXp: number }[] = [];
  const xpResultats: ResultatActivite[] = [];

  for (const [quete, template] of [
    [queteJour, templateJour],
    [queteSemaine, templateSemaine],
  ] as const) {
    if (quete.statut === "completee") continue;
    const nouvelleProgression = evaluerProgressionQuete(template.condition, quete.progression, quete.objectif, evenement);
    if (nouvelleProgression === quete.progression) continue;
    const misAJour = await incrementerQuete(quete.id, nouvelleProgression, sql);
    if (misAJour.statut === "completee") {
      xpResultats.push(await appliquerXp(sql, { type: "quete", xp: misAJour.recompenseXp, jour }));
      completees.push({ titre: template.titre, recompenseXp: misAJour.recompenseXp });
    }
  }

  return { completees, xpResultats };
}

async function traiterArc(
  sql: SqlClient,
  evenement: EvenementActivite,
  jour: string,
): Promise<{ arc: ResultatEnregistrement["arc"]; xpResultats: ResultatActivite[] }> {
  const arc = await getArcActif(sql);
  if (!arc) return { arc: undefined, xpResultats: [] };

  if (arc.statut === "en_cours") {
    const seancesDepuisDebut = arc.demarreA ? await compterSeancesDepuis(arc.demarreA, sql) : 0;
    const objectifAtteint = objectifArcAtteint(arc.objectifMesure, seancesDepuisDebut);
    const dureeEcoulee = arc.demarreA ? dureeArcEcoulee(arc.demarreA, arc.dureeSemaines, new Date()) : false;

    if (objectifAtteint || dureeEcoulee) {
      await passerEnBoss(arc.id, sql);
      await creerQueteSiAbsente(
        { templateId: `boss-${arc.id}`, portee: "boss", periodeDebut: jour, objectif: 1, recompenseXp: XP_BOSS, arcId: arc.id },
        sql,
      );
      return { arc: { titre: arc.titre, statut: "boss_en_cours", bossTitre: arc.bossTitre }, xpResultats: [] };
    }
    return { arc: { titre: arc.titre, statut: arc.statut }, xpResultats: [] };
  }

  if (arc.statut === "boss_en_cours" && defiBossReussi(arc.bossCondition, evenement)) {
    const queteBoss = await getQueteBossActiveParArc(arc.id, sql);
    await cloreArc(arc.id, sql);
    const xpResultats: ResultatActivite[] = [];
    if (queteBoss) {
      const misAJour = await incrementerQuete(queteBoss.id, queteBoss.objectif, sql);
      xpResultats.push(await appliquerXp(sql, { type: "boss", xp: misAJour.recompenseXp, jour }));
    }
    await debloquerAchievement("premier_arc_clos", { arcId: arc.id }, sql);
    const arcSuivant = await activerArcSuivant(arc.ordre, sql);
    return {
      arc: { titre: arc.titre, statut: "clos", bossTitre: arc.bossTitre, bossReussi: true, arcSuivantActive: !!arcSuivant },
      xpResultats,
    };
  }

  return { arc: { titre: arc.titre, statut: arc.statut }, xpResultats: [] };
}

async function evaluerEtDebloquerAchievements(sql: SqlClient): Promise<AchievementDef[]> {
  const dejaDebloques = (await listAchievementsDebloques(sql)).map((a) => a.code);
  const [seances, poids, arcsClos, etat] = await Promise.all([
    sql`SELECT count(*)::int AS count FROM seances`,
    sql`SELECT count(*)::int AS count FROM poids`,
    sql`SELECT count(*)::int AS count FROM arcs_narratifs WHERE statut = 'clos'`,
    getGamificationEtatPourMaj(sql),
  ]);

  const nouveaux = evaluerNouveauxAchievements(
    {
      niveau: niveauDepuisXp(etat.xpTotal),
      streakActuel: etat.streakActuel,
      streakRecord: etat.streakRecord,
      totalSeances: seances[0].count as number,
      totalPesees: poids[0].count as number,
      arcsClos: arcsClos[0].count as number,
      objectifPoidsAtteint: dejaDebloques.includes("objectif_poids_atteint"),
    },
    dejaDebloques,
  );

  for (const achievement of nouveaux) {
    await debloquerAchievement(achievement.code, {}, sql);
  }

  return nouveaux;
}

export async function enregistrerSeance(input: {
  type: string;
  dureeMinutes: number;
  exercices: string[];
  ressenti: string | null;
}): Promise<ResultatEnregistrement> {
  return getSql().begin(async (sql) => {
    const seance = await addSeance(input, sql);
    const { jour, semaine } = await periodesCourantes(sql);
    const evenement: EvenementActivite = { type: "seance", dureeMinutes: input.dureeMinutes, jour };

    const resultatBase = await appliquerXp(sql, evenement);
    const { completees, xpResultats: xpQuetes } = await traiterQuetes(sql, evenement, jour, semaine);
    const { arc, xpResultats: xpArc } = await traiterArc(sql, evenement, jour);
    const achievementsDebloques = await evaluerEtDebloquerAchievements(sql);

    return {
      seance,
      gamification: combiner([resultatBase, ...xpQuetes, ...xpArc]),
      questsCompletees: completees,
      achievementsDebloques,
      arc,
    };
  });
}

export async function enregistrerPoids(input: { valeur: number; mesureA?: string }): Promise<ResultatEnregistrement> {
  return getSql().begin(async (sql) => {
    const poids = await addPoids(input, sql);
    const { jour, semaine } = await periodesCourantes(sql);
    const evenement: EvenementActivite = { type: "poids", jour };

    const resultatBase = await appliquerXp(sql, evenement);
    const xpBonus: ResultatActivite[] = [];

    const profil = await getProfil();
    if (profil?.poidsObjectif != null && input.valeur <= profil.poidsObjectif) {
      const deblocage = await debloquerAchievement("objectif_poids_atteint", { poids: input.valeur }, sql);
      if (deblocage) {
        xpBonus.push(await appliquerXp(sql, { type: "objectif_poids", xp: XP_OBJECTIF_POIDS_ATTEINT, jour }));
      }
    }

    const { completees, xpResultats: xpQuetes } = await traiterQuetes(sql, evenement, jour, semaine);
    const { arc, xpResultats: xpArc } = await traiterArc(sql, evenement, jour);
    const achievementsDebloques = await evaluerEtDebloquerAchievements(sql);

    return {
      poids,
      gamification: combiner([resultatBase, ...xpBonus, ...xpQuetes, ...xpArc]),
      questsCompletees: completees,
      achievementsDebloques,
      arc,
    };
  });
}
