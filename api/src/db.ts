/**
 *  db.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 *  The only place that talks to the database. A generated query is checked here
 *  before it runs, and the login it runs as can only read.
 */
import sql from 'mssql';

export const MAX_ROWS = 500;

// Users is deliberately absent: it stores plaintext volunteer PINs.
const ALLOWED_TABLES = [
  'Buildings',
  'Categories',
  'Items',
  'Residents',
  'Tracking',
  'TransactionItems',
  'Transactions',
  'TransactionTypes',
  'Units',
];

export class SqlRejected extends Error {}

type Cell = string | number;

export interface QueryResult {
  columns: string[];
  rows: Cell[][];
  truncated: boolean;
}

// ─── Connection ───────────────────────────────────────────────────────────────

let pool: Promise<sql.ConnectionPool> | null = null;

// One pool for the host's lifetime. A failed connect is forgotten so the next
// question wakes a paused Azure SQL, instead of failing until the host recycles.
function getPool(): Promise<sql.ConnectionPool> {
  if (pool) return pool;

  // Read here, not at module load: dotenv runs after this module is evaluated.
  const connectionString = process.env.DATABASE_CONNECTION_STRING_ASK_DATA;
  if (!connectionString) {
    return Promise.reject(new Error('No connection string is configured.'));
  }

  const connecting = new sql.ConnectionPool(connectionString).connect();
  pool = connecting;
  connecting.catch(() => {
    if (pool === connecting) pool = null;
  });
  return connecting;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

interface ColumnRow {
  TABLE_NAME: string;
  COLUMN_NAME: string;
  DATA_TYPE: string;
}

let schema: string | null = null;

// One line per table, such as "Items(id int, name nvarchar)". Read once and kept
// for the host's lifetime, because it is the same for every question.
export async function getSchema(): Promise<string> {
  if (schema) return schema;

  const names = ALLOWED_TABLES.map((table) => `'${table}'`).join(',');
  const pool = await getPool();
  const { recordset } = await pool.request().query<ColumnRow>(
    `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME IN (${names})
      ORDER BY TABLE_NAME, ORDINAL_POSITION`,
  );

  const columnsByTable = new Map<string, string[]>();
  for (const { TABLE_NAME, COLUMN_NAME, DATA_TYPE } of recordset) {
    const columns = columnsByTable.get(TABLE_NAME) ?? [];
    columns.push(`${COLUMN_NAME} ${DATA_TYPE}`);
    columnsByTable.set(TABLE_NAME, columns);
  }

  schema = [...columnsByTable]
    .map(([table, columns]) => `${table}(${columns.join(', ')})`)
    .join('\n');
  return schema;
}

// ─── Validation ───────────────────────────────────────────────────────────────

const BANNED =
  /--|\/\*|\b(INSERT|UPDATE|DELETE|MERGE|INTO|WAITFOR|OPENROWSET|OPENQUERY|OPENDATASOURCE|EXEC|EXECUTE|GRANT|REVOKE|SHUTDOWN|xp_\w+|sp_\w+)\b/i;
const TABLE_REF =
  /\b(?:FROM|JOIN)\s+((?:\[[^\]]+\]|\w+)(?:\s*\.\s*(?:\[[^\]]+\]|\w+))*)/gi;
const CTE_NAME = /(?:\bWITH|,)\s*(\[[^\]]+\]|\w+)\s+AS\s*\(/gi;

const unbracket = (name: string): string => name.trim().replace(/^\[|\]$/g, '');

function reject(reason: string): never {
  throw new SqlRejected(reason);
}

function checkTableReferences(statement: string): void {
  // What the statement may name: the allowlist, plus any CTE it declares itself.
  const known = new Set(ALLOWED_TABLES.map((table) => table.toLowerCase()));
  for (const [, name] of statement.matchAll(CTE_NAME)) {
    known.add(unbracket(name).toLowerCase());
  }

  for (const [, reference] of statement.matchAll(TABLE_REF)) {
    const parts = reference.split('.').map(unbracket);
    if (parts.length > 2) reject(`"${reference}" reaches another database.`);
    if (parts.length === 2 && parts[0].toLowerCase() !== 'dbo') {
      reject(`"${reference}" is outside the dbo schema.`);
    }

    const table = parts[parts.length - 1];
    if (!known.has(table.toLowerCase())) {
      reject(`Table "${table}" is off limits.`);
    }
  }
}

// Allowlist, not blocklist: anything not proven safe is refused. Throws
// SqlRejected with a reason worth showing the user.
export function validateSql(generated: string): string {
  const statement = generated.trim().replace(/;+\s*$/, '');

  if (!statement) reject('No query was generated.');
  if (statement.includes(';')) reject('Only one statement is allowed.');
  if (!/^(SELECT|WITH)\b/i.test(statement)) {
    reject('Only read-only SELECT queries are allowed.');
  }

  const banned = BANNED.exec(statement);
  if (banned) reject(`"${banned[0]}" is not allowed.`);

  checkTableReferences(statement);
  return statement;
}

// ─── Query ────────────────────────────────────────────────────────────────────

// Values go straight into a table cell or a CSV, so a midnight date reads as a
// plain day and anything else keeps its minutes.
function formatCell(value: unknown): Cell {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value;
  if (!(value instanceof Date)) return String(value);

  const [date, time] = value.toISOString().split('T');
  return time.startsWith('00:00:00') ? date : `${date} ${time.slice(0, 5)}`;
}

/** Runs a statement that validateSql has already accepted. */
export async function runQuery(statement: string): Promise<QueryResult> {
  const pool = await getPool();
  const { recordset } = await pool.request().query(statement);
  const columns = Object.keys(recordset?.columns ?? {});
  const rows = recordset ?? [];

  return {
    columns,
    rows: rows
      .slice(0, MAX_ROWS)
      .map((row) => columns.map((column) => formatCell(row[column]))),
    truncated: rows.length > MAX_ROWS,
  };
}
