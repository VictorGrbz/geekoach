import postgres from "postgres";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL manquante (npx dotenv -e .env.local -- node scripts/migrate.mjs)");
}

const sql = postgres(process.env.DATABASE_URL, { ssl: false });
const schema = readFileSync(join(__dirname, "../src/db/schema.sql"), "utf8");

await sql.unsafe(schema);
console.log(
  "Migration appliquée : tables `profil`, `poids`, `seances`, `messages`, `gamification_etat`, `xp_evenements`, `arcs_narratifs`, `quetes_instances`, `achievements_debloques` prêtes.",
);
await sql.end();
