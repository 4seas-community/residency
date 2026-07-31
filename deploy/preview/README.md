# Residency preview deployment

The preview environment follows this single-source flow:

1. Developers push to the Gitea `test` branch.
2. Gitea push-mirrors the repository to
   `github.com/4seas-community/residency`.
3. GitHub Actions tests and builds the exact mirrored commit.
4. The standalone release is sent to the dedicated exe.dev preview VM through
   its token-protected, VM-local deployment receiver. The exe.dev edge proxy
   cuts long-running request bodies, so the archive is uploaded as small
   numbered parts; the receiver reassembles them and verifies the
   whole-archive sha256 before activating.
5. The VM activates the release atomically and restores the previous release
   when its health checks fail.

`main` remains the production source and no longer auto-deploys anywhere;
production releases stay manual per `docs/MAINTENANCE-AND-DEPLOYMENT.md`.

The preview build keeps the production-compatible `/residency` base path. It
uses the production Supabase project with an isolated `residency_preview`
schema, separate administrator credentials, and synthetic applicant records.
It never reads or writes the production application tables.

Required GitHub `preview` environment secrets:

- `PREVIEW_DEPLOY_TOKEN`
- `PREVIEW_DEPLOY_URL` — stable exe.dev VM URL used for release uploads
- `PREVIEW_URL`

Runtime application secrets are stored only on the preview VM in
`/etc/4seas-preview/residency.env`; they are not GitHub build secrets.
The file must provide:

- `DATABASE_URL` — the Supabase connection URL with
  `options=-c search_path=residency_preview`
- `ADMIN_PASSWORD` — generate with `openssl rand -base64 24`
- `SESSION_SECRET` — generate with `openssl rand -hex 48`
- `NEXT_PUBLIC_BASE_PATH=/residency`

The authentication runtime reads `SESSION_SECRET` exactly. Do not rename it to
`ADMIN_SESSION_SECRET`; doing so lets the login page render but makes every
successful password submission fail while creating the signed session.

The deploy receiver service definition is versioned beside this document.
Its systemd write allow-list covers the complete residency release directory
because the activation child updates `incoming`, `releases`, and the `current`
symlink inside the receiver's mount namespace.
