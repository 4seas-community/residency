import 'server-only'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import { queryDb } from '@/lib/db'

function normalizeMessageId(value: string | undefined | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.startsWith('<') ? trimmed : `<${trimmed.replace(/^<|>$/g, '')}>`
}

function normalizeSubject(value: string): string {
  return value.replace(/^(\s*(re|fw|fwd)\s*:\s*)+/gi, '').trim().toLowerCase()
}

function addressOf(parsed: Awaited<ReturnType<typeof simpleParser>>): { address: string; name: string | null } {
  const first = parsed.from?.value[0]
  return {
    address: first?.address?.trim().toLowerCase() ?? '',
    name: first?.name?.trim() || null,
  }
}

export interface InboundSyncResult {
  scanned: number
  inserted: number
  matched: number
  unmatched: number
}

export async function syncInboundReplies(): Promise<InboundSyncResult> {
  const host = process.env.IMAP_HOST || process.env.SMTP_HOST
  const port = Number(process.env.IMAP_PORT ?? '993')
  const user = process.env.IMAP_USER || process.env.SMTP_USER
  const password = process.env.IMAP_PASSWORD || process.env.SMTP_PASSWORD
  if (!host || !Number.isInteger(port) || !user || !password) {
    throw new Error('IMAP_HOST / IMAP_PORT / IMAP_USER / IMAP_PASSWORD not configured')
  }

  const client = new ImapFlow({
    host,
    port,
    secure: process.env.IMAP_SECURE !== 'false',
    auth: { user, pass: password },
    logger: false,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
  })

  const result: InboundSyncResult = { scanned: 0, inserted: 0, matched: 0, unmatched: 0 }
  await client.connect()
  const lock = await client.getMailboxLock('INBOX')
  try {
    const since = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
    const uids = await client.search({ since }, { uid: true })
    if (!uids || uids.length === 0) return result

    const uidValidity = client.mailbox ? client.mailbox.uidValidity.toString() : null
    for await (const message of client.fetch(uids, { uid: true, source: true, internalDate: true }, { uid: true })) {
      if (!message.source) continue
      result.scanned += 1
      const parsed = await simpleParser(message.source)
      const sender = addressOf(parsed)
      if (!sender.address || sender.address === user.toLowerCase()) continue

      const messageId =
        normalizeMessageId(parsed.messageId) ?? `<imap-${uidValidity ?? 'unknown'}-${message.uid}@${host}>`
      const exists = await queryDb('select 1 from inbound_emails where message_id = $1', [messageId])
      if (exists.rowCount) continue

      const inReplyTo = normalizeMessageId(parsed.inReplyTo)
      const references = (Array.isArray(parsed.references) ? parsed.references : parsed.references ? [parsed.references] : [])
        .map(normalizeMessageId)
        .filter((value): value is string => Boolean(value))
      const referencedIds = [...new Set([inReplyTo, ...references].filter((value): value is string => Boolean(value)))]

      let applicationId: string | null = null
      let emailLogId: string | null = null
      let matchedBy: 'message_id' | 'sender' | 'unmatched' = 'unmatched'

      if (referencedIds.length > 0) {
        const linked = await queryDb(
          `select id, application_id
             from email_log
            where resend_id = any($1::text[])
            order by created_at desc
            limit 1`,
          [referencedIds],
        )
        if (linked.rows[0]) {
          emailLogId = linked.rows[0].id as string
          applicationId = linked.rows[0].application_id as string
          matchedBy = 'message_id'
        }
      }

      if (!applicationId) {
        const candidates = await queryDb(
          `select a.id,
                  (select e.id
                     from email_log e
                    where e.application_id = a.id
                    order by e.created_at desc
                    limit 1) as email_log_id,
                  (select e.subject
                     from email_log e
                    where e.application_id = a.id
                    order by e.created_at desc
                    limit 1) as latest_subject
             from applications a
            where lower(a.email) = $1
            order by a.created_at desc`,
          [sender.address],
        )
        const subject = normalizeSubject(parsed.subject ?? '')
        const exactSubject = candidates.rows.find(
          (row) => row.latest_subject && normalizeSubject(String(row.latest_subject)) === subject,
        )
        const chosen = exactSubject ?? (candidates.rows.length === 1 ? candidates.rows[0] : null)
        if (chosen) {
          applicationId = chosen.id as string
          emailLogId = (chosen.email_log_id as string | null) ?? null
          matchedBy = 'sender'
        }
      }

      const referencesHeader = references.length ? references.join(' ') : null
      const receivedAt =
        (parsed.date instanceof Date && !Number.isNaN(parsed.date.getTime()) ? parsed.date : null) ??
        (message.internalDate instanceof Date ? message.internalDate : new Date(message.internalDate ?? Date.now()))
      const inserted = await queryDb(
        `insert into inbound_emails
          (application_id, email_log_id, message_id, in_reply_to, references_header,
           from_address, from_name, subject, body_text, received_at,
           mailbox_uid, mailbox_uidvalidity, matched_by)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         on conflict (message_id) do nothing`,
        [
          applicationId,
          emailLogId,
          messageId,
          inReplyTo,
          referencesHeader,
          sender.address,
          sender.name,
          parsed.subject ?? '',
          (parsed.text ?? '').trim().slice(0, 100_000),
          receivedAt,
          message.uid,
          uidValidity,
          matchedBy,
        ],
      )
      if (!inserted.rowCount) continue
      result.inserted += 1
      if (applicationId) result.matched += 1
      else result.unmatched += 1
    }
  } finally {
    lock.release()
    await client.logout().catch(() => undefined)
  }
  return result
}
