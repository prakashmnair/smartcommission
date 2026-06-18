import { db } from '@/lib/db'

// SmartCommission allowed tables — never include audit/security/credential tables
export const ALLOWED_TABLES = [
  'organisations',
  'users',
  'compensation_plans',
  'plan_rules',
  'plan_participants',
  'quotas',
  'territories',
  'territory_assignments',
  'transactions',
  'credit_allocations',
  'calculation_runs',
  'earnings_records',
  'payment_runs',
  'payments',
  'disputes',
]

const BLOCKED_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE',
  'EXEC', 'EXECUTE', 'CALL', 'COPY', 'GRANT', 'REVOKE', 'VACUUM',
  'REINDEX', 'CLUSTER', 'LOCK', 'COMMENT', 'SECURITY', 'OWNER',
  'SET ROLE', 'SET SESSION', 'RESET', 'LOAD', 'IMPORT',
  '--', '/*', '*/', 'XP_', 'SP_',
]

export interface QueryValidationResult {
  valid: boolean
  error?: string
  normalizedSql?: string
}

export function validateSql(sql: string, allowedTables: string[] = ALLOWED_TABLES): QueryValidationResult {
  const trimmed = sql.trim()
  if (!trimmed) return { valid: false, error: 'Query is empty' }

  const upper = trimmed.toUpperCase()

  // Must be a SELECT statement
  if (!upper.match(/^SELECT\s/)) {
    return { valid: false, error: 'Only SELECT queries are allowed' }
  }

  // Block dangerous keywords
  for (const keyword of BLOCKED_KEYWORDS) {
    if (upper.includes(keyword)) {
      return { valid: false, error: `Keyword "${keyword}" is not permitted` }
    }
  }

  // Block semicolons except at end (prevent statement stacking)
  const withoutEnd = trimmed.replace(/;$/, '')
  if (withoutEnd.includes(';')) {
    return { valid: false, error: 'Multiple statements are not allowed' }
  }

  // Validate table names in FROM/JOIN clauses
  const tablePattern = /(?:FROM|JOIN)\s+["']?(\w+)["']?/gi
  const matches = [...trimmed.matchAll(tablePattern)]
  for (const match of matches) {
    const table = match[1].toLowerCase()
    if (!allowedTables.includes(table)) {
      return { valid: false, error: `Table "${table}" is not accessible in the query console` }
    }
  }

  return { valid: true, normalizedSql: trimmed }
}

export async function executeQuery(
  sql: string,
  _organisationId: string,
  allowedTables: string[] = ALLOWED_TABLES,
  timeoutMs = 30_000
): Promise<{ rows: unknown[]; columnNames: string[]; rowCount: number; executionMs: number }> {
  const validation = validateSql(sql, allowedTables)
  if (!validation.valid) throw new Error(validation.error)

  // Wrap query and add row limit
  const tenantedSql = `
    WITH __tenant_data AS (
      ${sql.replace(/;$/, '')}
    )
    SELECT * FROM __tenant_data
    LIMIT 1001
  `

  const start = Date.now()
  const rows = await Promise.race([
    db.$queryRawUnsafe(tenantedSql) as Promise<unknown[]>,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Query timeout (30s)')), timeoutMs)),
  ])

  const executionMs = Date.now() - start
  const columnNames = rows.length > 0 ? Object.keys(rows[0] as Record<string, unknown>) : []

  return {
    rows: rows.slice(0, 1000),
    columnNames,
    rowCount: rows.length > 1000 ? 1000 : rows.length,
    executionMs,
  }
}
