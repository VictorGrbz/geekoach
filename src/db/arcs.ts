import { getSql, type SqlClient } from "./index";
import type { ConditionArc, ConditionBoss } from "@/lib/arcs";

export type Arc = {
  id: number;
  ordre: number;
  titre: string;
  theme: string;
  objectifCle: string;
  objectifMesure: ConditionArc;
  dureeSemaines: number;
  bossTitre: string;
  bossDescription: string;
  bossCondition: ConditionBoss;
  statut: "a_venir" | "en_cours" | "boss_en_cours" | "clos";
  demarreA: string | null;
  closA: string | null;
};

function toArc(row: {
  id: number;
  ordre: number;
  titre: string;
  theme: string;
  objectif_cle: string;
  objectif_mesure: ConditionArc;
  duree_semaines: number;
  boss_titre: string;
  boss_description: string;
  boss_condition: ConditionBoss;
  statut: string;
  demarre_a: string | null;
  clos_a: string | null;
}): Arc {
  return {
    id: row.id,
    ordre: row.ordre,
    titre: row.titre,
    theme: row.theme,
    objectifCle: row.objectif_cle,
    objectifMesure: row.objectif_mesure,
    dureeSemaines: row.duree_semaines,
    bossTitre: row.boss_titre,
    bossDescription: row.boss_description,
    bossCondition: row.boss_condition,
    statut: row.statut as Arc["statut"],
    demarreA: row.demarre_a,
    closA: row.clos_a,
  };
}

export async function getArcActif(sqlClient: SqlClient = getSql()): Promise<Arc | null> {
  const rows = await sqlClient`
    SELECT * FROM arcs_narratifs WHERE statut IN ('en_cours', 'boss_en_cours') LIMIT 1
  `;
  return rows.length > 0 ? toArc(rows[0] as Parameters<typeof toArc>[0]) : null;
}

export async function listArcs(sqlClient: SqlClient = getSql()): Promise<Arc[]> {
  const rows = await sqlClient`SELECT * FROM arcs_narratifs ORDER BY ordre ASC`;
  return rows.map((row) => toArc(row as Parameters<typeof toArc>[0]));
}

export async function compterSeancesDepuis(demarreA: string, sqlClient: SqlClient = getSql()): Promise<number> {
  const rows = await sqlClient`
    SELECT count(*)::int AS count FROM seances WHERE effectuee_a >= ${demarreA}
  `;
  return rows[0].count as number;
}

export async function passerEnBoss(arcId: number, sqlClient: SqlClient = getSql()): Promise<Arc> {
  const rows = await sqlClient`
    UPDATE arcs_narratifs SET statut = 'boss_en_cours' WHERE id = ${arcId} RETURNING *
  `;
  return toArc(rows[0] as Parameters<typeof toArc>[0]);
}

export async function cloreArc(arcId: number, sqlClient: SqlClient = getSql()): Promise<Arc> {
  const rows = await sqlClient`
    UPDATE arcs_narratifs SET statut = 'clos', clos_a = now() WHERE id = ${arcId} RETURNING *
  `;
  return toArc(rows[0] as Parameters<typeof toArc>[0]);
}

export async function activerArcSuivant(ordrePrecedent: number, sqlClient: SqlClient = getSql()): Promise<Arc | null> {
  const rows = await sqlClient`
    UPDATE arcs_narratifs SET statut = 'en_cours', demarre_a = now()
    WHERE ordre = ${ordrePrecedent + 1} AND statut = 'a_venir'
    RETURNING *
  `;
  return rows.length > 0 ? toArc(rows[0] as Parameters<typeof toArc>[0]) : null;
}
