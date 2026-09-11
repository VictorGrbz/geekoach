export function moyenneRecente<T extends { valeur: number; mesureA: string }>(
  entrees: T[],
  jours: number,
): number | null {
  const seuil = Date.now() - jours * 24 * 60 * 60 * 1000;
  const fenetre = entrees.filter((e) => new Date(e.mesureA).getTime() >= seuil);
  if (fenetre.length === 0) return null;
  return fenetre.reduce((sum, e) => sum + e.valeur, 0) / fenetre.length;
}

export function deltaSurFenetre<T extends { valeur: number; mesureA: string }>(
  entreesAsc: T[],
  jours: number,
): number | null {
  if (entreesAsc.length === 0) return null;
  const seuil = Date.now() - jours * 24 * 60 * 60 * 1000;
  const fenetre = entreesAsc.filter((e) => new Date(e.mesureA).getTime() >= seuil);
  if (fenetre.length < 2) return null;
  return fenetre[fenetre.length - 1].valeur - fenetre[0].valeur;
}

export type Tendance = "progression" | "plateau" | "regression" | "indeterminee";

export function classerTendance(deltaKg: number | null, seuilKg = 0.3): Tendance {
  if (deltaKg === null) return "indeterminee";
  if (deltaKg <= -seuilKg) return "progression";
  if (deltaKg >= seuilKg) return "regression";
  return "plateau";
}

export function debutSemaineCourante(): Date {
  const maintenant = new Date();
  const jour = (maintenant.getDay() + 6) % 7; // lundi = 0
  const debut = new Date(maintenant);
  debut.setHours(0, 0, 0, 0);
  debut.setDate(maintenant.getDate() - jour);
  return debut;
}

export function filtrerParPeriode<T extends { date: string }>(
  entrees: T[],
  periodeJours: number | null,
): T[] {
  if (periodeJours === null) return entrees;
  const seuil = Date.now() - periodeJours * 24 * 60 * 60 * 1000;
  return entrees.filter((e) => new Date(e.date).getTime() >= seuil);
}

export function agregerParSemaine<T extends { date: string }>(
  entreesAsc: T[],
): { semaine: string; label: string; count: number }[] {
  const parSemaine = new Map<string, { debut: Date; count: number }>();
  for (const e of entreesAsc) {
    const d = new Date(e.date);
    const jour = (d.getDay() + 6) % 7;
    const debut = new Date(d);
    debut.setHours(0, 0, 0, 0);
    debut.setDate(d.getDate() - jour);
    const cle = debut.toISOString().slice(0, 10);
    const existant = parSemaine.get(cle);
    if (existant) existant.count += 1;
    else parSemaine.set(cle, { debut, count: 1 });
  }
  return [...parSemaine.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([semaine, { debut, count }]) => ({
      semaine,
      label: debut.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
      count,
    }));
}
