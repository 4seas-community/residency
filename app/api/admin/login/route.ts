import { NextResponse } from "next/server"
import {
  adminCookieName,
  adminSessionMaxAge,
  createAdminSessionToken,
  isValidAdminPassword,
} from "@/lib/admin-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const password = typeof body?.password === "string" ? body.password : ""

    if (!isValidAdminPassword(password)) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(adminCookieName, createAdminSessionToken(), {
      httpOnly: true,
      maxAge: adminSessionMaxAge,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
