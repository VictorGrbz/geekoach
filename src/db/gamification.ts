import { getSql, type SqlClient } from "./index";
import type { EtatGamification } from "@/lib/xp";

function toEtat(row: {
  xp_total: number;
  streak_actuel: number;
  streak_record: number;
  derniere_activite: string | Date | null;
}): EtatGamification {
  return {
    xpTotal: row.xp_total,
    streakActuel: row.streak_actuel,
    streakRecord: row.streak_record,
    derniereActivite: row.derniere_activite ? new Date(row.derniere_activite).toISOString().slice(0, 10) : null,
  };
}

export async function getGamificationEtat(sqlClient: SqlClient = getSql()): Promise<EtatGamification> {
  const sql = sqlClient;
  const rows = await sql`SELECT * FROM gamification_etat WHERE id = 1`;
  return toEtat(rows[0] as Parameters<typeof toEtat>[0]);
}

/** Même lecture, mais verrouille la ligne — à utiliser uniquement à l'intérieur d'une transaction (`src/db/activites.ts`) avant une mise à jour. */
export async function getGamificationEtatPourMaj(sqlClient: SqlClient): Promise<EtatGamification> {
  const rows = await sqlClient`SELECT * FROM gamification_etat WHERE id = 1 FOR UPDATE`;
  return toEtat(rows[0] as Parameters<typeof toEtat>[0]);
}

export async function upsertGamificationEtat(
  next: EtatGamification,
  sqlClient: SqlClient = getSql(),
): Promise<EtatGamification> {
  const sql = sqlClient;
  const rows = await sql`
    UPDATE gamification_etat SET
      xp_total = ${next.xpTotal},
      streak_actuel = ${next.streakActuel},
      streak_record = ${next.streakRecord},
      derniere_activite = ${next.derniereActivite},
      updated_at = now()
    WHERE id = 1
    RETURNING *
  `;
  return toEtat(rows[0] as Parameters<typeof toEtat>[0]);
}
