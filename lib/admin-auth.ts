import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

export const adminCookieName = "residency_admin_session"
export const adminSessionMaxAge = 60 * 60 * 24 * 30

interface AdminSessionPayload {
  exp: number
  v: 1
}

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured")
  }
  return password
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured")
  }
  return secret
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)

  if (aBuffer.length !== bBuffer.length) {
    return false
  }

  return timingSafeEqual(aBuffer, bBuffer)
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url")
}

export function isValidAdminPassword(password: string) {
  return safeEqual(password, getAdminPassword())
}

export function createAdminSessionToken() {
  const payload: AdminSessionPayload = {
    exp: Date.now() + adminSessionMaxAge * 1000,
    v: 1,
  }
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${body}.${sign(body)}`
}

export function verifyAdminSessionToken(token: string | undefined) {
  if (!token) return false

  const [body, signature] = token.split(".")
  if (!body || !signature || !safeEqual(signature, sign(body))) {
    return false
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AdminSessionPayload
    return payload.v === 1 && payload.exp > Date.now()
  } catch {
    return false
  }
}

export async function hasValidAdminSession() {
  const cookieStore = await cookies()
  return verifyAdminSessionToken(cookieStore.get(adminCookieName)?.value)
}
