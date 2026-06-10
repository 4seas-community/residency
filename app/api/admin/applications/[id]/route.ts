import { NextRequest, NextResponse } from "next/server"
import { hasValidAdminSession } from "@/lib/admin-auth"
import { updateApplicationFields } from "@/lib/applications/db"
import { STATUS_CONFIG } from "@/lib/programs"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const VALID_STATUSES = new Set(Object.keys(STATUS_CONFIG))
const VALID_PROGRAMS = new Set(["crypto", "art", "longevity", "other"])

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

  const data = (body ?? {}) as Record<string, unknown>
  const fields: Record<string, unknown> = {}

  if (data.status !== undefined) {
    if (typeof data.status !== "string" || !VALID_STATUSES.has(data.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    fields.status = data.status
  }

  if (data.program_type !== undefined) {
    if (typeof data.program_type !== "string" || !VALID_PROGRAMS.has(data.program_type)) {
      return NextResponse.json({ error: "Invalid program_type" }, { status: 400 })
    }
    fields.program_type = data.program_type
  }

  if (data.actual_start_date !== undefined) {
    fields.actual_start_date =
      data.actual_start_date === null || data.actual_start_date === ""
        ? null
        : String(data.actual_start_date)
  }

  if (data.assigned_admin !== undefined) {
    fields.assigned_admin = data.assigned_admin === null ? null : String(data.assigned_admin)
  }

  if (typeof data.reviewed_by === "string") fields.reviewed_by = data.reviewed_by
  if (typeof data.reviewed_at === "string") fields.reviewed_at = data.reviewed_at

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  try {
    const application = await updateApplicationFields(id, fields)
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }
    return NextResponse.json({ application })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update application"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
