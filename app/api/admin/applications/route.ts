import { NextResponse } from "next/server"
import { hasValidAdminSession } from "@/lib/admin-auth"
import { listApplications } from "@/lib/applications"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const applications = await listApplications()
    return NextResponse.json({ applications })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load applications"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
