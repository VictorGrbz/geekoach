import { getSql, type SqlClient } from "./index";

export type XpEvenement = {
  id: number;
  source: "seance" | "poids" | "quete" | "boss";
  montant: number;
  libelle: string;
  survenuA: string;
};

function toXpEvenement(row: {
  id: number;
  source: string;
  montant: number;
  libelle: string;
  survenu_a: string;
}): XpEvenement {
  return {
    id: row.id,
    source: row.source as XpEvenement["source"],
    montant: row.montant,
    libelle: row.libelle,
    survenuA: row.survenu_a,
  };
}

export async function addXpEvenement(
  input: { source: XpEvenement["source"]; montant: number; libelle: string },
  sqlClient: SqlClient = getSql(),
): Promise<XpEvenement> {
  const rows = await sqlClient`
    INSERT INTO xp_evenements (source, montant, libelle)
    VALUES (${input.source}, ${input.montant}, ${input.libelle})
    RETURNING *
  `;
  return toXpEvenement(rows[0] as Parameters<typeof toXpEvenement>[0]);
}

export async function listXpEvenements(limit = 20, sqlClient: SqlClient = getSql()): Promise<XpEvenement[]> {
  const rows = await sqlClient`
    SELECT * FROM xp_evenements ORDER BY survenu_a DESC LIMIT ${limit}
  `;
  return rows.map((row) => toXpEvenement(row as Parameters<typeof toXpEvenement>[0]));
}
