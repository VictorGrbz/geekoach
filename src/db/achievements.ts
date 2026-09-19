import { getSql, type SqlClient } from "./index";

export type AchievementDebloque = {
  id: number;
  code: string;
  debloqueA: string;
  contexte: Record<string, unknown>;
};

function toAchievement(row: {
  id: number;
  code: string;
  debloque_a: string;
  contexte: Record<string, unknown>;
}): AchievementDebloque {
  return { id: row.id, code: row.code, debloqueA: row.debloque_a, contexte: row.contexte };
}

export async function listAchievementsDebloques(sqlClient: SqlClient = getSql()): Promise<AchievementDebloque[]> {
  const rows = await sqlClient`SELECT * FROM achievements_debloques ORDER BY debloque_a DESC`;
  return rows.map((row) => toAchievement(row as Parameters<typeof toAchievement>[0]));
}

/** Débloque un succès si absent. Renvoie la ligne si c'est un nouveau déblocage, `null` s'il existait déjà. */
export async function debloquerAchievement(
  code: string,
  contexte: Record<string, unknown> = {},
  sqlClient: SqlClient = getSql(),
): Promise<AchievementDebloque | null> {
  const rows = await sqlClient`
    INSERT INTO achievements_debloques (code, contexte)
    VALUES (${code}, ${sqlClient.json(contexte as never)})
    ON CONFLICT (code) DO NOTHING
    RETURNING *
  `;
  return rows.length > 0 ? toAchievement(rows[0] as Parameters<typeof toAchievement>[0]) : null;
}
