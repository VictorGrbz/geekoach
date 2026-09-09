import { getSql } from "./index";

export type Seance = {
  id: number;
  type: string;
  dureeMinutes: number;
  exercices: string[];
  ressenti: string | null;
  effectueeA: string;
};

function toSeance(row: {
  id: number;
  type: string;
  duree_minutes: number;
  exercices: string[];
  ressenti: string | null;
  effectuee_a: string;
}): Seance {
  return {
    id: row.id,
    type: row.type,
    dureeMinutes: row.duree_minutes,
    exercices: row.exercices,
    ressenti: row.ressenti,
    effectueeA: row.effectuee_a,
  };
}

export async function listSeances(limit = 50): Promise<Seance[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM seances
    ORDER BY effectuee_a DESC
    LIMIT ${limit}
  `;
  return rows.map((row) => toSeance(row as Parameters<typeof toSeance>[0]));
}

export async function addSeance(input: {
  type: string;
  dureeMinutes: number;
  exercices: string[];
  ressenti: string | null;
}): Promise<Seance> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO seances (type, duree_minutes, exercices, ressenti)
    VALUES (${input.type}, ${input.dureeMinutes}, ${sql.json(input.exercices)}, ${input.ressenti})
    RETURNING *
  `;
  return toSeance(rows[0] as Parameters<typeof toSeance>[0]);
}
