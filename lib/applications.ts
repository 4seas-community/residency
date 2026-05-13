import { randomUUID } from "node:crypto"
import { Pool } from "pg"

export interface ApplicationRecord {
  id: string
  created_at: string
  full_name: string
  email: string
  contact_info: string | null
  preferred_start_date: string
  about_and_contribution: string
  social_links: string
  linkedin_link: string | null
  github_link: string | null
  content_studio_plans: string | null
  status: string
}

export interface ApplicationInput {
  fullName: string
  email: string
  contactInfo: string
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
        preferred_start_date text not null,
        about_and_contribution text not null,
        social_links text not null,
        linkedin_link text,
        github_link text,
        content_studio_plans text,
        status text not null default 'pending'
      );

      create index if not exists residency_applications_created_at_idx
        on residency_applications (created_at desc);
    `).then(() => undefined)
  }

  return globalThis.residencyApplicationsSchemaReady
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
        preferred_start_date,
        about_and_contribution,
        social_links,
        linkedin_link,
        github_link,
        content_studio_plans
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      returning *
    `,
    [
      randomUUID(),
      input.fullName.trim(),
      input.email.trim(),
      input.contactInfo.trim(),
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
      preferred_start_date,
      about_and_contribution,
      social_links,
      linkedin_link,
      github_link,
      content_studio_plans,
      status
    from residency_applications
    order by created_at desc
  `)

  return result.rows
}
