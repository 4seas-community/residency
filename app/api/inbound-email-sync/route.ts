import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { syncInboundReplies } from '@/lib/email/inbound'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function authorized(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  if (!expected || !provided || expected.length !== provided.length) return false
  return timingSafeEqual(Buffer.from(expected), Buffer.from(provided))
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    return NextResponse.json(await syncInboundReplies())
  } catch (error) {
    console.error('Inbound email sync failed:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'sync_failed' }, { status: 500 })
  }
}
