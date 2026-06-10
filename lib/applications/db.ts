import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import type { Application, AdminComment } from "@/lib/applications/types"

/**
 * Server-side data access for residency applications, backed by PostgreSQL.
 * Replaces the previous Supabase browser client: all reads/writes now go
 * through API routes that call into these functions.
 */

declare global {
  // eslint-disable-next-line no-var
  var residencyPgPool: Pool | undefined
  // eslint-disable-next-line no-var
  var residencySchemaReady: Promise<void> | undefined
}

function getPool() {
  if (!globalThis.residencyPgPool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL is not configured")
    }
    globalThis.residencyPgPool = new Pool({ connectionString, max: 5 })
  }
  return globalThis.residencyPgPool
}

/**
 * Create the base tables if missing and additively widen residency_applications
 * with every column the multi-track app needs. ADD COLUMN IF NOT EXISTS is
 * idempotent and leaves the existing rows/data untouched (new columns are NULL,
 * program_type backfills to 'crypto').
 */
async function ensureSchema() {
  if (!globalThis.residencySchemaReady) {
    globalThis.residencySchemaReady = getPool()
      .query(`
        create table if not exists residency_applications (
          id uuid primary key,
          created_at timestamptz not null default now(),
          full_name text not null,
          email text not null,
          preferred_start_date text not null,
          about_and_contribution text not null,
          social_links text not null default '',
          status text not null default 'new'
        );

        alter table residency_applications
          add column if not exists updated_at timestamptz,
          add column if not exists program_type text default 'crypto',
          add column if not exists contact_info text,
          add column if not exists telegram text,
          add column if not exists whatsapp text,
          add column if not exists country text,
          add column if not exists city text,
          add column if not exists nationality text,
          add column if not exists current_location text,
          add column if not exists role_title text,
          add column if not exists organization text,
          add column if not exists website text,
          add column if not exists actual_start_date text,
          add column if not exists preferred_duration text,
          add column if not exists bio text,
          add column if not exists why_4seas text,
          add column if not exists why_this_track text,
          add column if not exists proposed_contribution text,
          add column if not exists linkedin_link text,
          add column if not exists github_link text,
          add column if not exists portfolio_url text,
          add column if not exists content_studio_plans text,
          add column if not exists needs_accommodation boolean,
          add column if not exists needs_support text,
          add column if not exists previous_community_experience text,
          add column if not exists anything_else text,
          add column if not exists program_specific_answers jsonb,
          add column if not exists admin_notes text,
          add column if not exists reviewed_by text,
          add column if not exists reviewed_at timestamptz,
          add column if not exists assigned_admin text;

        update residency_applications set program_type = 'crypto' where program_type is null;

        create index if not exists residency_applications_created_at_idx
          on residency_applications (created_at desc);

        create table if not exists admin_comments (
          id uuid primary key,
          application_id uuid not null references residency_applications(id) on delete cascade,
          reviewer_name text not null,
          comment text not null,
          created_at timestamptz not null default now()
        );

        create index if not exists admin_comments_application_created_at_idx
          on admin_comments (application_id, created_at desc);
      `)
      .then(() => {})
  }

  return globalThis.residencySchemaReady
}

const SELECT_COLUMNS = `
  id::text,
  created_at::text,
  updated_at::text,
  program_type,
  full_name,
  email,
  contact_info,
  telegram,
  whatsapp,
  country,
  city,
  nationality,
  current_location,
  role_title,
  organization,
  website,
  preferred_start_date,
  actual_start_date,
  preferred_duration,
  about_and_contribution,
  bio,
  why_4seas,
  why_this_track,
  proposed_contribution,
  social_links,
  linkedin_link,
  github_link,
  portfolio_url,
  content_studio_plans,
  needs_accommodation,
  needs_support,
  previous_community_experience,
  anything_else,
  program_specific_answers,
  status,
  reviewed_by,
  reviewed_at::text,
  assigned_admin
`

export interface CreateApplicationInput {
  program_type?: string | null
  full_name: string
  email: string
  contact_info?: string | null
  telegram?: string | null
  whatsapp?: string | null
  country?: string | null
  city?: string | null
  nationality?: string | null
  current_location?: string | null
  role_title?: string | null
  organization?: string | null
  website?: string | null
  preferred_start_date: string
  actual_start_date?: string | null
  preferred_duration?: string | null
  about_and_contribution: string
  bio?: string | null
  why_4seas?: string | null
  why_this_track?: string | null
  proposed_contribution?: string | null
  social_links?: string | null
  linkedin_link?: string | null
  github_link?: string | null
  portfolio_url?: string | null
  content_studio_plans?: string | null
  needs_accommodation?: boolean | null
  needs_support?: string | null
  previous_community_experience?: string | null
  anything_else?: string | null
  program_specific_answers?: Record<string, string> | null
  status?: string | null
}

export async function createApplication(input: CreateApplicationInput) {
  await ensureSchema()

  const result = await getPool().query<{ id: string }>(
    `
      insert into residency_applications (
        id, program_type, full_name, email, contact_info, telegram, whatsapp,
        country, city, nationality, current_location, role_title, organization, website,
        preferred_start_date, actual_start_date, preferred_duration,
        about_and_contribution, bio, why_4seas, why_this_track, proposed_contribution,
        social_links, linkedin_link, github_link, portfolio_url, content_studio_plans,
        needs_accommodation, needs_support, previous_community_experience, anything_else,
        program_specific_answers, status
      )
      values (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17,
        $18, $19, $20, $21, $22,
        $23, $24, $25, $26, $27,
        $28, $29, $30, $31,
        $32::jsonb, $33
      )
      returning id::text
    `,
    [
      randomUUID(),
      input.program_type ?? "crypto",
      input.full_name,
      input.email,
      input.contact_info ?? null,
      input.telegram ?? null,
      input.whatsapp ?? null,
      input.country ?? null,
      input.city ?? null,
      input.nationality ?? null,
      input.current_location ?? null,
      input.role_title ?? null,
      input.organization ?? null,
      input.website ?? null,
      input.preferred_start_date,
      input.actual_start_date ?? null,
      input.preferred_duration ?? null,
      input.about_and_contribution,
      input.bio ?? null,
      input.why_4seas ?? null,
      input.why_this_track ?? null,
      input.proposed_contribution ?? null,
      input.social_links ?? "",
      input.linkedin_link ?? null,
      input.github_link ?? null,
      input.portfolio_url ?? null,
      input.content_studio_plans ?? null,
      input.needs_accommodation ?? null,
      input.needs_support ?? null,
      input.previous_community_experience ?? null,
      input.anything_else ?? null,
      input.program_specific_answers ? JSON.stringify(input.program_specific_answers) : null,
      input.status ?? "new",
    ],
  )

  return result.rows[0]
}

export async function listApplications(): Promise<Application[]> {
  await ensureSchema()
  const result = await getPool().query<Application>(
    `select ${SELECT_COLUMNS} from residency_applications order by created_at desc`,
  )
  return result.rows
}

export async function listAdminComments(): Promise<AdminComment[]> {
  await ensureSchema()
  const result = await getPool().query<AdminComment>(`
    select
      id::text,
      application_id::text,
      reviewer_name,
      comment,
      created_at::text
    from admin_comments
    order by created_at desc
  `)
  return result.rows
}

/** Columns the admin dashboard is allowed to patch on an application. */
const UPDATABLE_COLUMNS = new Set([
  "status",
  "program_type",
  "actual_start_date",
  "assigned_admin",
  "reviewed_by",
  "reviewed_at",
  "admin_notes",
])

export async function updateApplicationFields(
  id: string,
  fields: Record<string, unknown>,
): Promise<Application | null> {
  await ensureSchema()

  const sets: string[] = ["updated_at = now()"]
  const params: unknown[] = [id]

  for (const [key, value] of Object.entries(fields)) {
    if (!UPDATABLE_COLUMNS.has(key)) continue
    params.push(value)
    sets.push(`${key} = $${params.length}`)
  }

  if (sets.length === 1) {
    // Nothing valid to update beyond the timestamp.
    const current = await getPool().query<Application>(
      `select ${SELECT_COLUMNS} from residency_applications where id = $1`,
      [id],
    )
    return current.rows[0] ?? null
  }

  const result = await getPool().query<Application>(
    `update residency_applications set ${sets.join(", ")} where id = $1 returning ${SELECT_COLUMNS}`,
    params,
  )
  return result.rows[0] ?? null
}

export interface CreateAdminCommentInput {
  applicationId: string
  reviewerName: string
  comment: string
}

export async function createAdminComment(input: CreateAdminCommentInput): Promise<AdminComment> {
  await ensureSchema()
  const result = await getPool().query<AdminComment>(
    `
      insert into admin_comments (id, application_id, reviewer_name, comment)
      values ($1, $2, $3, $4)
      returning id::text, application_id::text, reviewer_name, comment, created_at::text
    `,
    [randomUUID(), input.applicationId, input.reviewerName.trim(), input.comment.trim()],
  )
  return result.rows[0]
}

export async function deleteAdminComment(
  commentId: string,
  applicationId: string,
): Promise<AdminComment | null> {
  await ensureSchema()
  const result = await getPool().query<AdminComment>(
    `
      delete from admin_comments
      where id = $1 and application_id = $2
      returning id::text, application_id::text, reviewer_name, comment, created_at::text
    `,
    [commentId, applicationId],
  )
  return result.rows[0] ?? null
}
