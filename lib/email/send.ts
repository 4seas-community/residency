import 'server-only'
import nodemailer from 'nodemailer'
import { db } from '@/lib/db'
import { getEmailContent, renderCustomEmail } from '@/lib/email/templates'
import type { Application, EmailOverride, EmailType } from '@/lib/types'

export interface SendResult {
  outcome: 'sent' | 'failed'
  error?: string
}

/**
 * Deep module: render + send + audit-log in one call.
 * Never throws — a failed send is a normal, logged outcome.
 */
export async function sendApplicationEmail(opts: {
  application: Application
  type: EmailType
  triggeredBy: string
  override?: EmailOverride
}): Promise<SendResult> {
  const { application, type, triggeredBy, override } = opts
  const content = override ? renderCustomEmail(override.subject, override.text) : getEmailContent(type, application)

  let outcome: 'sent' | 'failed' = 'sent'
  let providerId: string | null = null
  let errorMessage: string | null = null

  try {
    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT ?? '465')
    const user = process.env.SMTP_USER
    const password = process.env.SMTP_PASSWORD
    const from = process.env.EMAIL_FROM
    if (!host || !Number.isInteger(port) || !user || !password || !from) {
      throw new Error('SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASSWORD / EMAIL_FROM not configured')
    }

    const transport = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE !== 'false',
      auth: { user, pass: password },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    })
    const info = await transport.sendMail({
      from,
      to: application.email,
      replyTo: process.env.EMAIL_REPLY_TO || user,
      subject: content.subject,
      html: content.html,
      text: content.text,
    })
    providerId = info.messageId || null
  } catch (err) {
    outcome = 'failed'
    errorMessage = err instanceof Error ? err.message : String(err)
  }

  const { error: logError } = await db().from('email_log').insert({
    application_id: application.id,
    email_type: type,
    recipient: application.email,
    subject: content.subject,
    outcome,
    body_text: override ? content.text : null,
    resend_id: providerId,
    error: errorMessage,
    triggered_by: triggeredBy,
  })
  if (logError) console.error('email_log insert failed:', logError.message)

  return outcome === 'sent' ? { outcome } : { outcome, error: errorMessage ?? 'unknown error' }
}

/** Audit row for an admin's explicit "update without sending" choice. */
export async function logSkippedEmail(opts: {
  application: Application
  type: EmailType
  triggeredBy: string
  override?: EmailOverride
}): Promise<void> {
  const content = opts.override
    ? renderCustomEmail(opts.override.subject, opts.override.text)
    : getEmailContent(opts.type, opts.application)
  const { error } = await db().from('email_log').insert({
    application_id: opts.application.id,
    email_type: opts.type,
    recipient: opts.application.email,
    subject: content.subject,
    outcome: 'skipped',
    body_text: opts.override ? content.text : null,
    triggered_by: opts.triggeredBy,
  })
  if (error) console.error('email_log insert failed:', error.message)
}
