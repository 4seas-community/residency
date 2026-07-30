# CLAUDE.md

Guidance for coding agents working in this repository.

## Current system

4Seas Residency serves the public program pages, application funnel, and admin review dashboard for the crypto, art, and longevity tracks.

Current stack: Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · Supabase PostgreSQL · Stalwart SMTP/IMAP · systemd on the 4Seas VPS. Package manager: pnpm.

The canonical repository and issue tracker are on 4Seas Tea. GitHub is a read-only mirror used for preview automation.

## Routes and commands

The public `basePath` is `/residency`; the root of `4seas.xyz` is a separate site. Next.js prefixes routes, `<Link>` and `redirect()` automatically. Literal asset URLs and middleware redirects must include `/residency`.

```bash
pnpm dev
pnpm typecheck
COREPACK_ENABLE_PROJECT_SPEC=0 NEXT_PUBLIC_BASE_PATH=/residency pnpm build
pnpm seed
```

## Load-bearing rules

- The browser never connects directly to Supabase or the mailbox. Database access stays in server-only modules.
- Every admin server action must call `requireAdmin()`. Middleware is navigation convenience, not the security boundary.
- Production authentication uses `ADMIN_PASSWORD` and a signed session cookie. `SESSION_SECRET` must be configured.
- Production data lives in Supabase PostgreSQL. The VPS-local PostgreSQL copy is recovery-only and does not receive production writes.
- Outbound mail uses authenticated Stalwart SMTP. Applicant replies are synchronized through IMAP and displayed with the related application.
- Preserve `inbound_emails`, email history, review notes, the six-state workflow, and the `/residency` base path when changing the admin UI.
- Keep public copy in `lib/content/`; components receive track configuration instead of hardcoding per-track behavior.
- Keep email templates isomorphic because the preview dialog and SMTP sender must render the same content. Email failure must not roll back a status change.
- Preserve the public submission order: validation, honeypot, authoritative track-state check, rate limit, then insert.
- `confirmed_start_date` is the admin-adjustable move-in date; `preferred_start_date` remains the applicant's original choice.
- All user-visible times use GMT+7 helpers from `lib/applications/utils.ts`.
- Schema changes require a new reviewed SQL migration, a validated backup, and production verification. Do not mutate production data as part of ordinary code cleanup.
- Never commit credentials, connection strings, mailbox secrets, applicant data, backups, or production environment files.

## Source layout

- `lib/content/`: program and site copy.
- `lib/actions/`: server actions for public submission and admin workflows.
- `lib/db.ts`: server-only PostgreSQL access.
- `lib/email/`: SMTP sending, IMAP reply sync, and shared templates.
- `components/admin/`: admin dashboard and application details.
- `docs/PRD.md` and `docs/TECH-DESIGN.md`: historical v2 design baselines; current operational truth is `README.md`, `ARCHITECTURE.md`, and `docs/MAINTENANCE-AND-DEPLOYMENT.md`.

Every change must at least pass typecheck and the production-base-path build. UI changes also require a real browser check; production fixes require service and user-visible verification after deployment.
