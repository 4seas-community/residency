import { NextResponse } from "next/server"
import { hasValidAdminSession } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}
