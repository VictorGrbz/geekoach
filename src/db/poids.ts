import { getSql, type SqlClient } from "./index";

export type EntreePoids = {
  id: number;
  valeur: number;
  mesureA: string;
};

export async function listPoids(limit = 90): Promise<EntreePoids[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, valeur, mesure_a FROM poids
    ORDER BY mesure_a DESC
    LIMIT ${limit}
  `;
  return rows.map((row) => ({
    id: row.id,
    valeur: Number(row.valeur),
    mesureA: row.mesure_a,
  }));
}

export async function addPoids(
  input: { valeur: number; mesureA?: string },
  sqlClient: SqlClient = getSql(),
): Promise<EntreePoids> {
  const sql = sqlClient;
  const rows = await sql`
    INSERT INTO poids (valeur, mesure_a)
    VALUES (${input.valeur}, COALESCE(${input.mesureA ?? null}, now()))
    RETURNING id, valeur, mesure_a
  `;
  const row = rows[0];
  return { id: row.id, valeur: Number(row.valeur), mesureA: row.mesure_a };
}
