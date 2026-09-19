import { getSql, type SqlClient } from "./index";

export type QueteInstance = {
  id: number;
  templateId: string;
  portee: "jour" | "semaine" | "boss";
  periodeDebut: string;
  progression: number;
  objectif: number;
  recompenseXp: number;
  statut: "active" | "completee" | "expiree";
  completeeA: string | null;
  arcId: number | null;
};

function toQuete(row: {
  id: number;
  template_id: string;
  portee: string;
  periode_debut: string | Date;
  progression: number;
  objectif: number;
  recompense_xp: number;
  statut: string;
  completee_a: string | null;
  arc_id: number | null;
}): QueteInstance {
  return {
    id: row.id,
    templateId: row.template_id,
    portee: row.portee as QueteInstance["portee"],
    periodeDebut: new Date(row.periode_debut).toISOString().slice(0, 10),
    progression: row.progression,
    objectif: row.objectif,
    recompenseXp: row.recompense_xp,
    statut: row.statut as QueteInstance["statut"],
    completeeA: row.completee_a,
    arcId: row.arc_id,
  };
}

export async function getQueteInstance(
  templateId: string,
  periodeDebut: string,
  sqlClient: SqlClient = getSql(),
): Promise<QueteInstance | null> {
  const rows = await sqlClient`
    SELECT * FROM quetes_instances WHERE template_id = ${templateId} AND periode_debut = ${periodeDebut}
  `;
  return rows.length > 0 ? toQuete(rows[0] as Parameters<typeof toQuete>[0]) : null;
}

export async function creerQueteSiAbsente(
  input: {
    templateId: string;
    portee: QueteInstance["portee"];
    periodeDebut: string;
    objectif: number;
    recompenseXp: number;
    arcId?: number;
  },
  sqlClient: SqlClient = getSql(),
): Promise<QueteInstance> {
  await sqlClient`
    INSERT INTO quetes_instances (template_id, portee, periode_debut, objectif, recompense_xp, arc_id)
    VALUES (${input.templateId}, ${input.portee}, ${input.periodeDebut}, ${input.objectif}, ${input.recompenseXp}, ${input.arcId ?? null})
    ON CONFLICT (template_id, periode_debut) DO NOTHING
  `;
  const quete = await getQueteInstance(input.templateId, input.periodeDebut, sqlClient);
  if (!quete) throw new Error(`Quête introuvable après création : ${input.templateId}/${input.periodeDebut}`);
  return quete;
}

export async function incrementerQuete(
  id: number,
  nouvelleProgression: number,
  sqlClient: SqlClient = getSql(),
): Promise<QueteInstance> {
  const rows = await sqlClient`
    UPDATE quetes_instances SET
      progression = ${nouvelleProgression},
      statut = CASE WHEN ${nouvelleProgression} >= objectif THEN 'completee' ELSE statut END,
      completee_a = CASE WHEN ${nouvelleProgression} >= objectif AND completee_a IS NULL THEN now() ELSE completee_a END
    WHERE id = ${id}
    RETURNING *
  `;
  return toQuete(rows[0] as Parameters<typeof toQuete>[0]);
}

export async function getQueteBossActiveParArc(
  arcId: number,
  sqlClient: SqlClient = getSql(),
): Promise<QueteInstance | null> {
  const rows = await sqlClient`
    SELECT * FROM quetes_instances WHERE portee = 'boss' AND arc_id = ${arcId} AND statut = 'active'
    LIMIT 1
  `;
  return rows.length > 0 ? toQuete(rows[0] as Parameters<typeof toQuete>[0]) : null;
}

/** Quêtes jour/semaine de la période courante + quête boss active, pour affichage (accueil, /quetes, coach). */
export async function listQuetesActives(sqlClient: SqlClient = getSql()): Promise<QueteInstance[]> {
  const rows = await sqlClient`
    SELECT * FROM quetes_instances
    WHERE (portee = 'jour' AND periode_debut = CURRENT_DATE)
       OR (portee = 'semaine' AND periode_debut = date_trunc('week', CURRENT_DATE)::date)
       OR (portee = 'boss' AND statut = 'active')
    ORDER BY portee, created_at
  `;
  return rows.map((row) => toQuete(row as Parameters<typeof toQuete>[0]));
}
