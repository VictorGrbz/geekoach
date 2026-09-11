import { getSql } from "./index";

export type Message = {
  id: number;
  role: "user" | "model";
  contenu: string;
  profilMaj: Record<string, unknown> | null;
  creeA: string;
};

function toMessage(row: {
  id: number;
  role: string;
  contenu: string;
  profil_maj: Record<string, unknown> | null;
  cree_a: string;
}): Message {
  return {
    id: row.id,
    role: row.role as Message["role"],
    contenu: row.contenu,
    profilMaj: row.profil_maj,
    creeA: row.cree_a,
  };
}

export async function listMessages(limit = 100): Promise<Message[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM (
      SELECT * FROM messages ORDER BY cree_a DESC LIMIT ${limit}
    ) recents
    ORDER BY cree_a ASC
  `;
  return rows.map((row) => toMessage(row as Parameters<typeof toMessage>[0]));
}

export async function addMessage(input: {
  role: "user" | "model";
  contenu: string;
  profilMaj?: Record<string, unknown> | null;
}): Promise<Message> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO messages (role, contenu, profil_maj)
    VALUES (${input.role}, ${input.contenu}, ${sql.json((input.profilMaj ?? null) as never)})
    RETURNING *
  `;
  return toMessage(rows[0] as Parameters<typeof toMessage>[0]);
}

export async function countMessagesModelDepuis(depuis: Date): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    SELECT count(*)::int AS count FROM messages
    WHERE role = 'model' AND cree_a >= ${depuis.toISOString()}
  `;
  return rows[0].count as number;
}
