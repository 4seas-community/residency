# Residency preview deployment

The preview environment follows this single-source flow:

1. Developers push to the Gitea `main` branch.
2. Gitea push-mirrors the repository to
   `github.com/4seas-community/residency`.
3. GitHub Actions tests and builds the exact mirrored commit.
4. The standalone release is sent to the dedicated exe.dev preview VM through
   its token-protected, VM-local deployment receiver.
5. The VM activates the release atomically and restores the previous release
   when its health checks fail.

The preview build keeps the production-compatible `/residency` base path. It
uses the production Supabase project with an isolated `residency_preview`
schema, separate administrator credentials, and synthetic applicant records.
It never reads or writes the production application tables.

Required GitHub `preview` environment secrets:

- `PREVIEW_DEPLOY_TOKEN`
- `PREVIEW_URL`

Runtime application secrets are stored only on the preview VM in
`/etc/4seas-preview/residency.env`; they are not GitHub build secrets.
