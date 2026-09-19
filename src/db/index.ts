import postgres from "postgres";

let _sql: ReturnType<typeof postgres> | null = null;

export function getSql() {
  if (!_sql) {
    _sql = postgres(process.env.DATABASE_URL!, { ssl: false });
  }
  return _sql;
}

/** Client SQL générique (connexion directe ou intérieur d'une transaction `sql.begin`) — interface commune à `Sql` et `TransactionSql`. */
export type SqlClient = postgres.ISql;
