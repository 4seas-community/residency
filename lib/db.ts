import 'server-only'
import { Pool } from 'pg'
import { serializeDateValues } from '@/lib/serialization'
import type { Application, EmailLog, InboundEmail, ReviewNote } from '@/lib/types'

type DbResult = { data: unknown; error: Error | null; count?: number | null }
type Operation = 'select' | 'insert' | 'update'

let pool: Pool | null = null

function connection(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) throw new Error('DATABASE_URL not configured')
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      ssl: { rejectUnauthorized: false },
    })
  }
  return pool
}

export function queryDb(text: string, values: unknown[] = []) {
  return connection().query(text, values)
}

function ident(value: string): string {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) throw new Error(`Invalid SQL identifier: ${value}`)
  return `"${value}"`
}

class QueryBuilder implements PromiseLike<DbResult> {
  private operation: Operation = 'select'
  private columns = '*'
  private payload: Record<string, unknown> | null = null
  private filters: Array<{ column: string; operator: '=' | '>='; value: unknown }> = []
  private orderBy: { column: string; ascending: boolean } | null = null
  private rowLimit: number | null = null
  private countOnly = false

  constructor(private readonly table: string) {}

  select(columns = '*', options?: { count?: 'exact'; head?: boolean }): this {
    this.columns = columns
    this.countOnly = options?.count === 'exact' && options?.head === true
    return this
  }

  insert(payload: Record<string, unknown>): this {
    this.operation = 'insert'
    this.payload = payload
    return this
  }

  update(payload: Record<string, unknown>): this {
    this.operation = 'update'
    this.payload = payload
    return this
  }

  eq(column: string, value: unknown): this {
    this.filters.push({ column, operator: '=', value })
    return this
  }

  gte(column: string, value: unknown): this {
    this.filters.push({ column, operator: '>=', value })
    return this
  }

  order(column: string, options: { ascending: boolean }): this {
    this.orderBy = { column, ascending: options.ascending }
    return this
  }

  limit(value: number): this {
    this.rowLimit = value
    return this
  }

  async single(): Promise<DbResult> {
    const result = await this.execute()
    if (result.error) return result
    const rows = result.data as unknown[]
    return rows.length === 1
      ? { ...result, data: rows[0] }
      : { ...result, data: null, error: new Error(`Expected one row, received ${rows.length}`) }
  }

  async maybeSingle(): Promise<DbResult> {
    const result = await this.execute()
    if (result.error) return result
    const rows = result.data as unknown[]
    return rows.length <= 1
      ? { ...result, data: rows[0] ?? null }
      : { ...result, data: null, error: new Error(`Expected zero or one row, received ${rows.length}`) }
  }

  then<TResult1 = DbResult, TResult2 = never>(
    onfulfilled?: ((value: DbResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected)
  }

  private where(values: unknown[]): string {
    if (!this.filters.length) return ''
    return ` WHERE ${this.filters
      .map((filter) => {
        values.push(filter.value)
        return `${ident(filter.column)} ${filter.operator} $${values.length}`
      })
      .join(' AND ')}`
  }

  private returning(): string {
    if (this.columns === '*') return ' RETURNING *'
    return ` RETURNING ${this.columns.split(',').map((column) => ident(column.trim())).join(', ')}`
  }

  private async execute(): Promise<DbResult> {
    try {
      const values: unknown[] = []
      let sql: string

      if (this.operation === 'insert') {
        const entries = Object.entries(this.payload ?? {})
        const columns = entries.map(([column]) => ident(column)).join(', ')
        const placeholders = entries.map(([, value]) => {
          values.push(value)
          return `$${values.length}`
        })
        sql = `INSERT INTO ${ident(this.table)} (${columns}) VALUES (${placeholders.join(', ')})${this.returning()}`
      } else if (this.operation === 'update') {
        const assignments = Object.entries(this.payload ?? {}).map(([column, value]) => {
          values.push(value)
          return `${ident(column)} = $${values.length}`
        })
        sql = `UPDATE ${ident(this.table)} SET ${assignments.join(', ')}${this.where(values)}${this.returning()}`
      } else if (this.countOnly) {
        sql = `SELECT count(*)::int AS count FROM ${ident(this.table)}${this.where(values)}`
      } else {
        const selected =
          this.columns === '*' ? '*' : this.columns.split(',').map((column) => ident(column.trim())).join(', ')
        sql = `SELECT ${selected} FROM ${ident(this.table)}${this.where(values)}`
        if (this.orderBy) {
          sql += ` ORDER BY ${ident(this.orderBy.column)} ${this.orderBy.ascending ? 'ASC' : 'DESC'}`
        }
        if (this.rowLimit !== null) {
          values.push(this.rowLimit)
          sql += ` LIMIT $${values.length}`
        }
      }

      const result = await connection().query(sql, values)
      if (this.countOnly) return { data: null, error: null, count: result.rows[0]?.count ?? 0 }
      return { data: serializeDateValues(result.rows), error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) }
    }
  }
}

export function db() {
  return {
    from(table: string) {
      return new QueryBuilder(table)
    },
  }
}

export interface DashboardData {
  applications: Application[]
  notes: ReviewNote[]
  emailLogs: EmailLog[]
  inboundEmails: InboundEmail[]
}

export interface ApplicationDetailData {
  application: Application
  notes: ReviewNote[]
  emailLogs: EmailLog[]
  inboundEmails: InboundEmail[]
}

export async function getApplicationDetail(id: string): Promise<ApplicationDetailData | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null
  const [app, notes, logs, inbound] = await Promise.all([
    db().from('applications').select('*').eq('id', id).maybeSingle(),
    db().from('review_notes').select('*').eq('application_id', id).order('created_at', { ascending: false }),
    db().from('email_log').select('*').eq('application_id', id).order('created_at', { ascending: false }),
    db().from('inbound_emails').select('*').eq('application_id', id).order('received_at', { ascending: false }),
  ])
  if (app.error) throw app.error
  if (!app.data) return null
  if (notes.error) throw notes.error
  if (logs.error) throw logs.error
  if (inbound.error) throw inbound.error
  return {
    application: app.data as Application,
    notes: notes.data as ReviewNote[],
    emailLogs: logs.data as EmailLog[],
    inboundEmails: inbound.data as InboundEmail[],
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const [apps, notes, logs, inbound] = await Promise.all([
    db().from('applications').select('*').order('created_at', { ascending: false }),
    db().from('review_notes').select('*').order('created_at', { ascending: false }),
    db().from('email_log').select('*').order('created_at', { ascending: false }),
    db().from('inbound_emails').select('*').order('received_at', { ascending: false }),
  ])
  if (apps.error) throw apps.error
  if (notes.error) throw notes.error
  if (logs.error) throw logs.error
  if (inbound.error) throw inbound.error
  return {
    applications: apps.data as Application[],
    notes: notes.data as ReviewNote[],
    emailLogs: logs.data as EmailLog[],
    inboundEmails: inbound.data as InboundEmail[],
  }
}
