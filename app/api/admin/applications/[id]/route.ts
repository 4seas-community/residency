import { NextRequest, NextResponse } from "next/server"
import { hasValidAdminSession } from "@/lib/admin-auth"
import {
  applicationStatuses,
  updateApplicationReview,
  type ApplicationStatus,
} from "@/lib/applications"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" && applicationStatuses.includes(value as ApplicationStatus)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Invalid application id" }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const payload = (body ?? {}) as { status?: unknown; adminNotes?: unknown }

  const update: { status?: ApplicationStatus; adminNotes?: string | null; reviewedBy: string } = {
    reviewedBy: "Admin",
  }

  if (payload.status !== undefined) {
    if (!isApplicationStatus(payload.status)) {
      return NextResponse.json(
        { error: `status must be one of ${applicationStatuses.join(", ")}` },
        { status: 400 },
      )
    }
    update.status = payload.status
  }

  if (payload.adminNotes !== undefined) {
    if (payload.adminNotes !== null && typeof payload.adminNotes !== "string") {
      return NextResponse.json({ error: "adminNotes must be a string or null" }, { status: 400 })
    }
    update.adminNotes = payload.adminNotes as string | null
  }

  if (update.status === undefined && update.adminNotes === undefined) {
    return NextResponse.json(
      { error: "Provide status and/or adminNotes" },
      { status: 400 },
    )
  }

  try {
    const application = await updateApplicationReview(id, update)
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }
    return NextResponse.json({ application })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update application"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
