import { NextResponse } from "next/server"
import { hasValidAdminSession } from "@/lib/admin-auth"
import { deleteAdminComment } from "@/lib/applications"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, commentId } = await params
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Invalid application id" }, { status: 400 })
  }
  if (!uuidRegex.test(commentId)) {
    return NextResponse.json({ error: "Invalid comment id" }, { status: 400 })
  }

  try {
    const comment = await deleteAdminComment(id, commentId)
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }
    return NextResponse.json({ comment })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete comment"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
