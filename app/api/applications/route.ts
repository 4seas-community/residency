import { NextResponse } from "next/server"
import { createApplication, type ApplicationInput } from "@/lib/applications"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function parseApplicationPayload(body: unknown): ApplicationInput {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body")
  }

  const data = body as Record<string, unknown>
  const application = {
    fullName: stringValue(data.fullName),
    email: stringValue(data.email),
    contactInfo: stringValue(data.contactInfo),
    nationality: stringValue(data.nationality),
    preferredStartDate: stringValue(data.preferredStartDate),
    aboutAndContribution: stringValue(data.aboutAndContribution),
    socialLinks: stringValue(data.socialLinks),
    linkedinLink: stringValue(data.linkedinLink),
    githubLink: stringValue(data.githubLink),
    contentStudioPlans: stringValue(data.contentStudioPlans),
  }

  if (!application.fullName) throw new Error("Full name is required")
  if (!emailPattern.test(application.email)) throw new Error("A valid email is required")
  if (!application.contactInfo) throw new Error("WhatsApp or Telegram is required")
  if (!application.nationality) throw new Error("Nationality is required")
  if (!application.preferredStartDate) throw new Error("Preferred start date is required")
  if (!application.aboutAndContribution) throw new Error("About and contribution is required")
  if (countWords(application.aboutAndContribution) > 300) {
    throw new Error("Please keep your response under 300 words")
  }
  if (!application.socialLinks) throw new Error("At least one social link is required")

  return application
}

export async function POST(request: Request) {
  try {
    const application = parseApplicationPayload(await request.json())
    const created = await createApplication(application)

    return NextResponse.json({ application: created }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit application"
    const status = message.includes("configured") ? 500 : 400

    return NextResponse.json({ error: message }, { status })
  }
}
