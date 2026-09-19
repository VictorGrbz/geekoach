import { XP_QUETE_JOUR, XP_QUETE_SEMAINE, type EvenementActivite } from "./xp";

export type ConditionQuete =
  | { type: "activite_jour" }
  | { type: "seances_semaine"; count: number }
  | { type: "pesees_semaine"; count: number };

export type QueteTemplate = {
  id: string;
  portee: "jour" | "semaine";
  titre: string;
  description: string;
  condition: ConditionQuete;
  objectif: number;
  recompenseXp: number;
};

export const QUETES_QUOTIDIENNES: QueteTemplate[] = [
  {
    id: "activite-du-jour",
    portee: "jour",
    titre: "Une trace sur la carte",
    description: "Enregistre une séance ou une pesée aujourd'hui.",
    condition: { type: "activite_jour" },
    objectif: 1,
    recompenseXp: XP_QUETE_JOUR,
  },
];

export const QUETES_HEBDOMADAIRES: QueteTemplate[] = [
  {
    id: "trois-seances-semaine",
    portee: "semaine",
    titre: "Trois passages rouverts",
    description: "Logue 3 séances cette semaine.",
    condition: { type: "seances_semaine", count: 3 },
    objectif: 3,
    recompenseXp: XP_QUETE_SEMAINE,
  },
  {
    id: "deux-pesees-semaine",
    portee: "semaine",
    titre: "Deux repères sur la carte",
    description: "Enregistre 2 pesées cette semaine.",
    condition: { type: "pesees_semaine", count: 2 },
    objectif: 2,
    recompenseXp: XP_QUETE_SEMAINE,
  },
];

function numeroSemaineISO(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const jourSemaine = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - jourSemaine);
  const debutAnnee = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - debutAnnee.getTime()) / 86400000 + 1) / 7);
}

export function selectionnerQueteQuotidienne(jour: Date): QueteTemplate {
  const index = numeroSemaineISO(jour) * 7 + jour.getUTCDay();
  return QUETES_QUOTIDIENNES[index % QUETES_QUOTIDIENNES.length];
}

export function selectionnerQueteHebdomadaire(debutSemaine: Date): QueteTemplate {
  const index = numeroSemaineISO(debutSemaine);
  return QUETES_HEBDOMADAIRES[index % QUETES_HEBDOMADAIRES.length];
}

export function trouverTemplateParId(id: string): QueteTemplate | undefined {
  return [...QUETES_QUOTIDIENNES, ...QUETES_HEBDOMADAIRES].find((t) => t.id === id);
}

export function evaluerProgressionQuete(
  condition: ConditionQuete,
  progressionActuelle: number,
  objectif: number,
  evenement: EvenementActivite,
): number {
  switch (condition.type) {
    case "activite_jour":
      return evenement.type === "seance" || evenement.type === "poids" ? objectif : progressionActuelle;
    case "seances_semaine":
      return evenement.type === "seance" ? Math.min(progressionActuelle + 1, objectif) : progressionActuelle;
    case "pesees_semaine":
      return evenement.type === "poids" ? Math.min(progressionActuelle + 1, objectif) : progressionActuelle;
  }
}
