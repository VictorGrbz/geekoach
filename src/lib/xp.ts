export const XP_SEANCE = 25;
export const XP_POIDS = 10;
export const XP_OBJECTIF_POIDS_ATTEINT = 100;
export const XP_QUETE_JOUR = 15;
export const XP_QUETE_SEMAINE = 40;
export const XP_BOSS = 150;

const XP_PAR_PALIER = 100;

/** XP cumulé requis pour ATTEINDRE ce niveau (niveau 1 = 0 XP). Courbe triangulaire : chaque niveau coûte 100 XP de plus que le précédent. */
export function xpCumulPourNiveau(niveau: number): number {
  const n = niveau - 1;
  return (XP_PAR_PALIER * n * (n + 1)) / 2;
}

export function niveauDepuisXp(xpTotal: number): number {
  let niveau = 1;
  while (xpCumulPourNiveau(niveau + 1) <= xpTotal) niveau += 1;
  return niveau;
}

export function progressionNiveau(xpTotal: number): {
  niveau: number;
  xpDansNiveau: number;
  xpRequisNiveau: number;
  ratio: number;
} {
  const niveau = niveauDepuisXp(xpTotal);
  const seuilActuel = xpCumulPourNiveau(niveau);
  const seuilSuivant = xpCumulPourNiveau(niveau + 1);
  const xpRequisNiveau = seuilSuivant - seuilActuel;
  const xpDansNiveau = xpTotal - seuilActuel;
  return { niveau, xpDansNiveau, xpRequisNiveau, ratio: xpDansNiveau / xpRequisNiveau };
}

export type EvenementActivite =
  | { type: "seance"; dureeMinutes: number; jour: string }
  | { type: "poids"; jour: string }
  | { type: "quete" | "boss" | "objectif_poids"; xp: number; jour: string };

export type EtatGamification = {
  xpTotal: number;
  streakActuel: number;
  streakRecord: number;
  derniereActivite: string | null;
};

export type ResultatActivite = {
  etat: EtatGamification;
  xpGagne: number;
  niveauAvant: number;
  niveauApres: number;
  leveledUp: boolean;
  streakProlongee: boolean;
  streakBrisee: boolean;
};

function xpDeLEvenement(evenement: EvenementActivite): number {
  switch (evenement.type) {
    case "seance":
      return XP_SEANCE;
    case "poids":
      return XP_POIDS;
    case "quete":
    case "boss":
    case "objectif_poids":
      return evenement.xp;
  }
}

function jourPrecedent(jour: string): string {
  const d = new Date(`${jour}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function calculerStreak(
  derniereActivite: string | null,
  streakActuel: number,
  streakRecord: number,
  jour: string,
): { streakActuel: number; streakRecord: number; streakBrisee: boolean; streakProlongee: boolean } {
  if (derniereActivite === jour) {
    return { streakActuel, streakRecord, streakBrisee: false, streakProlongee: false };
  }

  const continuite = derniereActivite === jourPrecedent(jour);
  const nouveauStreak = continuite ? streakActuel + 1 : 1;
  const streakBrisee = !continuite && derniereActivite !== null;

  return {
    streakActuel: nouveauStreak,
    streakRecord: Math.max(streakRecord, nouveauStreak),
    streakBrisee,
    streakProlongee: continuite,
  };
}

export function appliquerActivite(etat: EtatGamification, evenement: EvenementActivite): ResultatActivite {
  const xpGagne = xpDeLEvenement(evenement);
  const niveauAvant = niveauDepuisXp(etat.xpTotal);
  const xpTotal = etat.xpTotal + xpGagne;
  const niveauApres = niveauDepuisXp(xpTotal);

  const { streakActuel, streakRecord, streakBrisee, streakProlongee } = calculerStreak(
    etat.derniereActivite,
    etat.streakActuel,
    etat.streakRecord,
    evenement.jour,
  );

  return {
    etat: { xpTotal, streakActuel, streakRecord, derniereActivite: evenement.jour },
    xpGagne,
    niveauAvant,
    niveauApres,
    leveledUp: niveauApres > niveauAvant,
    streakProlongee,
    streakBrisee,
  };
}
