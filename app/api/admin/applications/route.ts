import { NextResponse } from "next/server"
import { hasValidAdminSession } from "@/lib/admin-auth"
import { listAdminComments, listApplications } from "@/lib/applications/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [applications, comments] = await Promise.all([listApplications(), listAdminComments()])
    return NextResponse.json({ applications, comments })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load applications"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
