# 4Seas Residency

Current production layout and data ownership: [ARCHITECTURE.md](./ARCHITECTURE.md).

Marketing site + application funnel + admin review dashboard for the 4Seas residency programs (crypto / art / longevity) in Chiang Mai.

Product spec: `docs/PRD.md` · Technical design: `docs/TECH-DESIGN.md` · Maintenance and deployment: `docs/MAINTENANCE-AND-DEPLOYMENT.md`

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Supabase PostgreSQL · Stalwart SMTP/IMAP · 4Seas VPS.

**Architecture in one line:** the browser never touches the database or mailbox; the VPS application talks directly to Supabase PostgreSQL and the 4Seas mail server.

## Commands

```bash
pnpm install
pnpm dev            # dev server
pnpm build          # production build
pnpm typecheck      # tsc --noEmit (build does NOT skip type errors)
pnpm seed           # insert 20 fake applications (needs .env.local)
```

## Setup

1. Run `supabase/migrations/` in numeric order.
2. Copy `.env.example` to a private environment file and provide the database, admin, session, SMTP, IMAP, and cron values.
3. Build the standalone Next.js release and run it on the VPS behind `/residency`.
4. Enable the VPS inbound-email timer documented in `ARCHITECTURE.md`.

## How it works

- **Public**: `/` (home) · `/residency/[track]` (track page; CTA driven by `state` in `lib/content/tracks.ts`) · `/residency/[track]/apply` (form) · `/apply` (legacy redirect).
- **Apply flow**: every track shows the same Apply → Review → Decision expectations, then zod validation → honeypot (fake success) → rate limit (3/hour per hashed IP) → insert with status `submitted`. No confirmation email by design — the in-form success state is the confirmation.
- **Admin**: `/admin/login` (shared long password → HMAC-signed cookie) · `/admin` (list, filters, and a full application sheet containing responses, notes, outbound email history, applicant replies, and status controls). Changing status to interview/accepted/rejected opens an email preview dialog (Update & send / Update without sending / Cancel). The email is **editable before sending**; edited sends are recorded in `email_log.body_text` and Retry resends the edited version. Status changes never roll back on email failure.
- **Status machine**: `submitted → reviewing → interview → accepted | rejected | cancelled`. `cancelled` = candidate-initiated exit (declined offer / cancelled interview) at any stage — no email. Distinct from admin-decided `rejected`.
- **Emails**: outbound mail uses authenticated SMTP. Applicant replies are imported over IMAP, matched to the originating application, deduplicated, and shown in the admin detail view. The `movein_guide` template is retained but currently has no trigger.
- **Content**: ALL copy lives in `lib/content/` (`tracks.ts`, `site.ts`, `start-dates.ts`). Components receive config as props — never hardcode per-track text in a component.

## Pending content (placeholders in code)

- Rejection email: replace placeholder wording with the community's existing template (`lib/email/templates.ts`).
- Coliving promo code value (`COLIVING_PROMO_CODE` in `lib/content/site.ts`).
- Move-in guide address/arrival details (`lib/email/templates.ts`).
