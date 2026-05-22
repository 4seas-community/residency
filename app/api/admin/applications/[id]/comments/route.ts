import { NextRequest, NextResponse } from "next/server"
import { hasValidAdminSession } from "@/lib/admin-auth"
import { createAdminComment } from "@/lib/applications"

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

  const payload = (body ?? {}) as { reviewerName?: unknown; comment?: unknown }
  if (typeof payload.reviewerName !== "string" || !payload.reviewerName.trim()) {
    return NextResponse.json({ error: "reviewerName is required" }, { status: 400 })
  }
  if (typeof payload.comment !== "string" || !payload.comment.trim()) {
    return NextResponse.json({ error: "comment is required" }, { status: 400 })
  }

  try {
    const comment = await createAdminComment({
      applicationId: id,
      reviewerName: payload.reviewerName,
      comment: payload.comment,
    })
    return NextResponse.json({ comment })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to add comment"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
