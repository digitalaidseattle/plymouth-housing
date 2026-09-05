/**
 *  askData.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 *  One question in, one answer out. The model writes a query, db.ts checks it
 *  and runs it, and only the rows come back to the browser.
 */
import { resolve } from 'path';
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { config } from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  getSchema,
  runQuery,
  validateSql,
  MAX_ROWS,
  SqlRejected,
} from '../db.js';

// Secrets live in the repo root .env, same as Vite and DAB. In Azure there is no
// .env and the values arrive as Static Web App settings instead. The host runs
// from api/, the SWA CLI sometimes from the repo root, so try both.
config({ path: resolve(process.cwd(), '../.env') });
config({ path: resolve(process.cwd(), '.env') });

const MODEL = 'gemini-2.5-flash';
const MAX_QUESTION_LENGTH = 500;
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;

interface AskDataRequest {
  question?: string;
}

interface QueryPlan {
  sql: string;
  display: 'number' | 'bar' | 'table';
  title: string;
  explanation: string;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    sql: { type: Type.STRING },
    display: { type: Type.STRING, enum: ['number', 'bar', 'table'] },
    title: { type: Type.STRING },
    explanation: { type: Type.STRING },
  },
  required: ['sql', 'display', 'title', 'explanation'],
};

// ─── Guards ───────────────────────────────────────────────────────────────────

// SWA injects this header after authenticating; a browser cannot set it.
function adminId(request: HttpRequest): string | null {
  const header = request.headers.get('x-ms-client-principal');
  if (!header) return null;

  try {
    const principal = JSON.parse(Buffer.from(header, 'base64').toString());
    const roles: unknown = principal?.userRoles;
    if (!Array.isArray(roles) || !roles.includes('admin')) return null;
    return String(principal.userId ?? 'unknown');
  } catch {
    return null;
  }
}

// Held in memory, so the count is per host instance and resets when the host
// recycles. It is a brake on a runaway page, not an accounting limit.
const recentCalls = new Map<string, number[]>();

function withinRateLimit(userId: string): boolean {
  const now = Date.now();
  const calls = (recentCalls.get(userId) ?? []).filter(
    (at) => now - at < RATE_WINDOW_MS,
  );
  if (calls.length >= RATE_LIMIT) return false;

  recentCalls.set(userId, [...calls, now]);
  return true;
}

/** Why this question cannot be asked, or null if it can. */
function questionProblem(question: string): string | null {
  if (!question) return 'Ask a question first.';
  if (question.length > MAX_QUESTION_LENGTH) return 'That question is too long.';
  return null;
}

// ─── The model ────────────────────────────────────────────────────────────────

// The host runs in UTC, so a question asked in the evening would be told it is
// already tomorrow. en-CA formats as YYYY-MM-DD.
const seattleToday = (): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
  }).format(new Date());

const instructions = (schema: string, today: string): string =>
  `You write T-SQL for a housing charity inventory database (Azure SQL) and nothing else.

Tables:
${schema}

Rules about the data:
- Transactions.transaction_type: 1 CHECKOUT, 2 RESTOCK, 3 CORRECTION, 4 CHECKOUT_EDIT.
- A type 4 row edits an earlier checkout and points at it through parent_transaction_id.
  Group by COALESCE(parent_transaction_id, id) so an edited checkout is still one checkout.
- TransactionItems.quantity is how many units moved. Items.quantity is stock on hand,
  and stock at or below Items.threshold is low.
- Residents sit in Units, Units sit in Buildings. Transactions also carry building_id.
- Today is ${today}. Turn phrases like "this week" into explicit dates. A week is the
  last 7 days including today unless the question says otherwise.

Rules about the query:
- One SELECT statement. No semicolons, no comments, no temp tables, no writes.
- Always include TOP (${MAX_ROWS}).
- Give every computed column a readable alias, because the alias becomes the column header.

Pick a display:
- "number" when the answer is a single figure. Return exactly one row and one column.
- "bar" for a ranking or a breakdown. First column is the label, second is the number,
  sorted, at most 15 rows.
- "table" for anything else.

Write "title" as a short heading and "explanation" as one sentence about what the query
counts. Never state a figure yourself, the query produces it.`;

// No history is sent: each question stands on its own.
async function planQuery(
  apiKey: string,
  question: string,
): Promise<{ plan: QueryPlan; totalTokens: number }> {
  const response = await new GoogleGenAI({ apiKey }).models.generateContent({
    model: MODEL,
    contents: question,
    config: {
      systemInstruction: instructions(await getSchema(), seattleToday()),
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0,
    },
  });

  const answered = JSON.parse(response.text ?? '{}');
  return {
    plan: {
      sql: String(answered.sql ?? ''),
      display: answered.display ?? 'table',
      title: answered.title ?? 'Result',
      explanation: answered.explanation ?? '',
    },
    totalTokens: response.usageMetadata?.totalTokenCount ?? 0,
  };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

const fail = (
  status: number,
  error: string,
  sql?: string,
): HttpResponseInit => ({ status, jsonBody: { error, sql } });

const askData = async (
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> => {
  const userId = adminId(request);
  if (!userId) return fail(403, 'Admins only.');
  if (!withinRateLimit(userId)) {
    return fail(429, 'Too many questions this hour. Try again later.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    context.error('GEMINI_API_KEY is not set');
    return fail(500, 'Ask the data is not configured.');
  }

  const body = (await request.json().catch(() => ({}))) as AskDataRequest;
  const question = body.question?.trim() ?? '';
  const problem = questionProblem(question);
  if (problem) return fail(400, problem);

  const startedAt = Date.now();
  let generated = '';

  try {
    const { plan, totalTokens } = await planQuery(apiKey, question);
    generated = plan.sql;

    const statement = validateSql(generated);
    const result = await runQuery(statement);

    context.log('AskData_Query', {
      display: plan.display,
      rowCount: result.rows.length,
      durationMs: Date.now() - startedAt,
      totalTokens,
    });

    return {
      status: 200,
      jsonBody: { ...plan, sql: statement, totalTokens, ...result },
    };
  } catch (error) {
    context.error('AskData failed', error);
    // The rejected query goes back too, so the user can see what was refused.
    if (error instanceof SqlRejected) {
      return fail(400, error.message, generated);
    }
    return fail(
      502,
      'Could not answer that one. Try rewording the question.',
      generated,
    );
  }
};

app.http('askData', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'ask-data',
  handler: askData,
});
