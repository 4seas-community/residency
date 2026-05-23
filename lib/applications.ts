import { randomUUID } from "node:crypto"
import { Pool } from "pg"

export type ApplicationStatus = "pending" | "approved" | "rejected"

export const applicationStatuses: ApplicationStatus[] = ["pending", "approved", "rejected"]

export interface ApplicationRecord {
  id: string
  created_at: string
  full_name: string
  email: string
  contact_info: string | null
  nationality: string | null
  preferred_start_date: string
  about_and_contribution: string
  social_links: string
  linkedin_link: string | null
  github_link: string | null
  content_studio_plans: string | null
  status: ApplicationStatus
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
}

export interface AdminCommentRecord {
  id: string
  application_id: string
  reviewer_name: string
  comment: string
  created_at: string
}

export interface ApplicationInput {
  fullName: string
  email: string
  contactInfo: string
  nationality: string
  preferredStartDate: string
  aboutAndContribution: string
  socialLinks: string
  linkedinLink?: string
  githubLink?: string
  contentStudioPlans?: string
}

declare global {
  var residencyApplicationsPool: Pool | undefined
  var residencyApplicationsSchemaReady: Promise<void> | undefined
}

interface LegacyAdminNoteRow {
  id: string
  admin_notes: string
  reviewer_name: string
  created_at: string
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured")
  }
  return databaseUrl
}

function getPool() {
  if (!globalThis.residencyApplicationsPool) {
    globalThis.residencyApplicationsPool = new Pool({
      connectionString: getDatabaseUrl(),
      max: 5,
    })
  }
  return globalThis.residencyApplicationsPool
}

async function ensureSchema() {
  if (!globalThis.residencyApplicationsSchemaReady) {
    globalThis.residencyApplicationsSchemaReady = getPool().query(`
      create table if not exists residency_applications (
        id uuid primary key,
        created_at timestamptz not null default now(),
        full_name text not null,
        email text not null,
        contact_info text,
        nationality text,
        preferred_start_date text not null,
        about_and_contribution text not null,
        social_links text not null,
        linkedin_link text,
        github_link text,
        content_studio_plans text,
        status text not null default 'pending'
      );

      alter table residency_applications
        add column if not exists nationality text,
        add column if not exists admin_notes text,
        add column if not exists reviewed_by text,
        add column if not exists reviewed_at timestamptz;

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
    `).then(() => backfillLegacyAdminNotes())
  }

  return globalThis.residencyApplicationsSchemaReady
}

async function backfillLegacyAdminNotes() {
  const pool = getPool()
  const notes = await pool.query<LegacyAdminNoteRow>(`
    select
      a.id::text,
      a.admin_notes,
      coalesce(nullif(btrim(a.reviewed_by), ''), 'Admin Note') as reviewer_name,
      coalesce(a.reviewed_at, a.created_at)::text as created_at
    from residency_applications a
    where a.admin_notes is not null
      and btrim(a.admin_notes) <> ''
      and not exists (
        select 1 from admin_comments c
        where c.application_id = a.id
          and btrim(c.comment) = btrim(a.admin_notes)
      )
  `)

  if (notes.rowCount === 0) {
    return
  }

  const params: unknown[] = []
  const values = notes.rows.map((note, index) => {
    const offset = index * 5
    params.push(
      randomUUID(),
      note.id,
      note.reviewer_name,
      note.admin_notes,
      note.created_at,
    )
    return `($${offset + 1}, $${offset + 2}::uuid, $${offset + 3}, $${offset + 4}, $${offset + 5}::timestamptz)`
  })

  await pool.query(
    `
      insert into admin_comments (
        id,
        application_id,
        reviewer_name,
        comment,
        created_at
      )
      values ${values.join(", ")}
      on conflict (id) do nothing
    `,
    params,
  )
}

function optionalText(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createApplication(input: ApplicationInput) {
  await ensureSchema()

  const result = await getPool().query<ApplicationRecord>(
    `
      insert into residency_applications (
        id,
        full_name,
        email,
        contact_info,
        nationality,
        preferred_start_date,
        about_and_contribution,
        social_links,
        linkedin_link,
        github_link,
        content_studio_plans
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      returning *
    `,
    [
      randomUUID(),
      input.fullName.trim(),
      input.email.trim(),
      input.contactInfo.trim(),
      input.nationality.trim(),
      input.preferredStartDate,
      input.aboutAndContribution.trim(),
      input.socialLinks.trim(),
      optionalText(input.linkedinLink),
      optionalText(input.githubLink),
      optionalText(input.contentStudioPlans),
    ],
  )

  return result.rows[0]
}

export async function listApplications() {
  await ensureSchema()

  const result = await getPool().query<ApplicationRecord>(`
    select
      id::text,
      created_at::text,
      full_name,
      email,
      contact_info,
      nationality,
      preferred_start_date,
      about_and_contribution,
      social_links,
      linkedin_link,
      github_link,
      content_studio_plans,
      status,
      admin_notes,
      reviewed_by,
      reviewed_at::text
    from residency_applications
    order by created_at desc
  `)

  return result.rows
}

export async function listAdminComments() {
  await ensureSchema()

  const result = await getPool().query<AdminCommentRecord>(`
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

export interface AdminCommentInput {
  applicationId: string
  reviewerName: string
  comment: string
}

export async function createAdminComment(input: AdminCommentInput) {
  await ensureSchema()

  const result = await getPool().query<AdminCommentRecord>(
    `
      insert into admin_comments (
        id,
        application_id,
        reviewer_name,
        comment
      )
      values ($1, $2, $3, $4)
      returning
        id::text,
        application_id::text,
        reviewer_name,
        comment,
        created_at::text
    `,
    [
      randomUUID(),
      input.applicationId,
      input.reviewerName.trim(),
      input.comment.trim(),
    ],
  )

  return result.rows[0]
}

export async function deleteAdminComment(applicationId: string, commentId: string) {
  await ensureSchema()

  const result = await getPool().query<AdminCommentRecord>(
    `
      delete from admin_comments
      where id = $1 and application_id = $2
      returning
        id::text,
        application_id::text,
        reviewer_name,
        comment,
        created_at::text
    `,
    [commentId, applicationId],
  )

  return result.rows[0] ?? null
}

export interface ApplicationReviewUpdate {
  status?: ApplicationStatus
  adminNotes?: string | null
  reviewedBy: string
}

export async function updateApplicationReview(id: string, update: ApplicationReviewUpdate) {
  await ensureSchema()

  const sets: string[] = ["reviewed_by = $2", "reviewed_at = now()"]
  const params: unknown[] = [id, update.reviewedBy]

  if (update.status !== undefined) {
    params.push(update.status)
    sets.push(`status = $${params.length}`)
  }
  if (update.adminNotes !== undefined) {
    params.push(update.adminNotes && update.adminNotes.trim() ? update.adminNotes : null)
    sets.push(`admin_notes = $${params.length}`)
  }

  const result = await getPool().query<ApplicationRecord>(
    `
      update residency_applications
      set ${sets.join(", ")}
      where id = $1
      returning
        id::text,
        created_at::text,
        full_name,
        email,
        contact_info,
        nationality,
        preferred_start_date,
        about_and_contribution,
        social_links,
        linkedin_link,
        github_link,
        content_studio_plans,
        status,
        admin_notes,
        reviewed_by,
        reviewed_at::text
    `,
    params,
  )

  return result.rows[0] ?? null
}
