import { NextResponse } from "next/server"
import { createApplication, type CreateApplicationInput } from "@/lib/applications/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_PROGRAMS = new Set(["crypto", "art", "longevity"])

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function optStr(value: unknown): string | null {
  const trimmed = typeof value === "string" ? value.trim() : ""
  return trimmed ? trimmed : null
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const data = (body ?? {}) as Record<string, unknown>

  const full_name = str(data.full_name)
  const email = str(data.email)
  const preferred_start_date = str(data.preferred_start_date)
  const about_and_contribution = str(data.about_and_contribution)
  const social_links = str(data.social_links)
  const contact_info = optStr(data.contact_info)
  const telegram = optStr(data.telegram)
  const whatsapp = optStr(data.whatsapp)

  if (!full_name) return NextResponse.json({ error: "Full name is required" }, { status: 400 })
  if (!emailPattern.test(email)) return NextResponse.json({ error: "A valid email is required" }, { status: 400 })
  if (!contact_info && !telegram && !whatsapp) {
    return NextResponse.json({ error: "WhatsApp or Telegram is required" }, { status: 400 })
  }
  if (!preferred_start_date) return NextResponse.json({ error: "Preferred start date is required" }, { status: 400 })
  if (!about_and_contribution) return NextResponse.json({ error: "Please tell us about yourself" }, { status: 400 })
  if (countWords(about_and_contribution) > 300) {
    return NextResponse.json({ error: "Please keep your response under 300 words" }, { status: 400 })
  }
  if (!social_links) return NextResponse.json({ error: "At least one social link is required" }, { status: 400 })

  const programType = optStr(data.program_type)
  const input: CreateApplicationInput = {
    program_type: programType && VALID_PROGRAMS.has(programType) ? programType : undefined,
    full_name,
    email,
    contact_info,
    telegram,
    whatsapp,
    country: optStr(data.country),
    city: optStr(data.city),
    nationality: optStr(data.nationality),
    current_location: optStr(data.current_location),
    role_title: optStr(data.role_title),
    organization: optStr(data.organization),
    website: optStr(data.website),
    preferred_start_date,
    actual_start_date: optStr(data.actual_start_date),
    preferred_duration: optStr(data.preferred_duration),
    about_and_contribution,
    bio: optStr(data.bio),
    why_4seas: optStr(data.why_4seas),
    why_this_track: optStr(data.why_this_track),
    proposed_contribution: optStr(data.proposed_contribution),
    social_links,
    linkedin_link: optStr(data.linkedin_link),
    github_link: optStr(data.github_link),
    portfolio_url: optStr(data.portfolio_url),
    content_studio_plans: optStr(data.content_studio_plans),
    needs_support: optStr(data.needs_support),
    previous_community_experience: optStr(data.previous_community_experience),
    anything_else: optStr(data.anything_else),
  }

  try {
    const created = await createApplication(input)
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 })
  } catch (error) {
    console.error("application submit error:", error)
    return NextResponse.json(
      { error: "Unable to submit application. Please try again." },
      { status: 500 },
    )
  }
}
