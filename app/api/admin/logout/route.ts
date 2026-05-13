import { NextResponse } from "next/server"
import { adminCookieName } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(adminCookieName, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return response
}
