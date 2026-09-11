import { getSql } from "./index";

export type Profil = {
  poidsObjectif: number | null;
  echeance: string | null;
  equipement: string[];
  contraintesSante: string[];
  preferences: Record<string, unknown>;
  updatedAt: string;
};

function toProfil(row: {
  poids_objectif: string | null;
  echeance: string | Date | null;
  equipement: string[];
  contraintes_sante: string[];
  preferences: Record<string, unknown>;
  updated_at: string;
}): Profil {
  return {
    poidsObjectif: row.poids_objectif !== null ? Number(row.poids_objectif) : null,
    echeance: row.echeance ? new Date(row.echeance).toISOString().slice(0, 10) : null,
    equipement: row.equipement,
    contraintesSante: row.contraintes_sante,
    preferences: row.preferences,
    updatedAt: row.updated_at,
  };
}

export async function getProfil(): Promise<Profil | null> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM profil WHERE id = 1`;
  return rows.length > 0 ? toProfil(rows[0] as Parameters<typeof toProfil>[0]) : null;
}

export async function upsertProfil(input: {
  poidsObjectif: number | null;
  echeance: string | null;
  equipement: string[];
  contraintesSante: string[];
  preferences: Record<string, unknown>;
}): Promise<Profil> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO profil (id, poids_objectif, echeance, equipement, contraintes_sante, preferences, updated_at)
    VALUES (1, ${input.poidsObjectif}, ${input.echeance}, ${sql.json(input.equipement)}, ${sql.json(input.contraintesSante)}, ${sql.json(input.preferences as never)}, now())
    ON CONFLICT (id) DO UPDATE SET
      poids_objectif = EXCLUDED.poids_objectif,
      echeance = EXCLUDED.echeance,
      equipement = EXCLUDED.equipement,
      contraintes_sante = EXCLUDED.contraintes_sante,
      preferences = EXCLUDED.preferences,
      updated_at = now()
    RETURNING *
  `;
  return toProfil(rows[0] as Parameters<typeof toProfil>[0]);
}
