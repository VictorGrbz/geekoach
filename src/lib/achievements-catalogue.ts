export type ContexteAchievements = {
  niveau: number;
  streakActuel: number;
  streakRecord: number;
  totalSeances: number;
  totalPesees: number;
  arcsClos: number;
  objectifPoidsAtteint: boolean;
};

export type AchievementDef = {
  code: string;
  titre: string;
  description: string;
  estDebloque: (ctx: ContexteAchievements) => boolean;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    code: "premier_pas",
    titre: "Premier pas",
    description: "Loguer sa première séance.",
    estDebloque: (ctx) => ctx.totalSeances >= 1,
  },
  {
    code: "premiere_pesee",
    titre: "Premier repère",
    description: "Enregistrer sa première pesée.",
    estDebloque: (ctx) => ctx.totalPesees >= 1,
  },
  {
    code: "dix_seances",
    titre: "Dix passages rouverts",
    description: "Loguer 10 séances au total.",
    estDebloque: (ctx) => ctx.totalSeances >= 10,
  },
  {
    code: "niveau_5",
    titre: "Niveau 5",
    description: "Atteindre le niveau 5.",
    estDebloque: (ctx) => ctx.niveau >= 5,
  },
  {
    code: "niveau_10",
    titre: "Niveau 10",
    description: "Atteindre le niveau 10.",
    estDebloque: (ctx) => ctx.niveau >= 10,
  },
  {
    code: "streak_7",
    titre: "Une semaine de suite",
    description: "Maintenir un streak de 7 jours.",
    estDebloque: (ctx) => ctx.streakRecord >= 7,
  },
  {
    code: "streak_30",
    titre: "Un mois de suite",
    description: "Maintenir un streak de 30 jours.",
    estDebloque: (ctx) => ctx.streakRecord >= 30,
  },
  {
    code: "premier_arc_clos",
    titre: "Premier arc clos",
    description: "Vaincre un boss et clore un arc narratif.",
    estDebloque: (ctx) => ctx.arcsClos >= 1,
  },
  {
    code: "objectif_poids_atteint",
    titre: "Objectif atteint",
    description: "Atteindre l'objectif de poids fixé dans le profil.",
    estDebloque: (ctx) => ctx.objectifPoidsAtteint,
  },
];

export function evaluerNouveauxAchievements(
  ctx: ContexteAchievements,
  dejaDebloques: string[],
): AchievementDef[] {
  const dejaDebloquesSet = new Set(dejaDebloques);
  return ACHIEVEMENTS.filter((a) => !dejaDebloquesSet.has(a.code) && a.estDebloque(ctx));
}
