import type { EvenementActivite } from "./xp";

export type ConditionArc = { type: "seances_min"; count: number };
export type ConditionBoss = { type: "seance_duree_min"; minutes: number };

export function objectifArcAtteint(condition: ConditionArc, seancesDepuisDebut: number): boolean {
  switch (condition.type) {
    case "seances_min":
      return seancesDepuisDebut >= condition.count;
  }
}

export function dureeArcEcoulee(demarreA: string, dureeSemaines: number, maintenant: Date): boolean {
  const finPrevue = new Date(demarreA);
  finPrevue.setDate(finPrevue.getDate() + dureeSemaines * 7);
  return maintenant >= finPrevue;
}

/** Numéro de semaine de l'arc en cours (1-indexé), pour affichage "semaine X/N". */
export function semaineCouranteArc(demarreA: string | null, maintenant: Date = new Date()): number {
  if (!demarreA) return 1;
  const jours = (maintenant.getTime() - new Date(demarreA).getTime()) / 86_400_000;
  return Math.max(1, Math.floor(jours / 7) + 1);
}

export function defiBossReussi(condition: ConditionBoss, evenement: EvenementActivite): boolean {
  switch (condition.type) {
    case "seance_duree_min":
      return evenement.type === "seance" && evenement.dureeMinutes >= condition.minutes;
  }
}
