import { NextRequest, NextResponse } from "next/server"
import { hasValidAdminSession } from "@/lib/admin-auth"
import { createAdminComment } from "@/lib/applications/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(
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
  const reviewerName = typeof data.reviewer_name === "string" ? data.reviewer_name : ""
  const comment = typeof data.comment === "string" ? data.comment : ""

  if (!reviewerName.trim()) {
    return NextResponse.json({ error: "reviewer_name is required" }, { status: 400 })
  }
  if (!comment.trim()) {
    return NextResponse.json({ error: "comment is required" }, { status: 400 })
  }

  try {
    const created = await createAdminComment({ applicationId: id, reviewerName, comment })
    return NextResponse.json({ comment: created })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to add comment"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
