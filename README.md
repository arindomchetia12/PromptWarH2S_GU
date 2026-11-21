# Schemes Discovery

A mobile-friendly discovery guide for Indian government schemes. Visitors can browse the demo catalogue or answer a short questionnaire to see transparent, rule-based comparisons with recorded criteria.

## Run on Replit

The app uses the project's PostgreSQL database; Supabase is not required for this MVP.

1. Start the `artifacts/api-server: API Server` and `artifacts/schemes-discovery: web` workflows.
2. Apply the development schema with `pnpm --filter @workspace/db run push`.
3. Add the clearly labelled examples with `pnpm --filter @workspace/db run seed`.
4. For catalogue administration, add `SCHEME_ADMIN_TOKEN` through Replit Secrets. Never put its value in source code, `.env.example`, browser storage, or chat.

`DATABASE_URL` is provided by the Replit PostgreSQL database workflow; do not copy its value into source code. `.env.example` lists variable names only.

The SQL schema reference is in `lib/db/migrations/0001_schemes.sql`; the Drizzle source of truth is `lib/db/src/schema/schemes.ts`.

## Demo catalogue limitations

The three seeded entries are fictional demonstration records, not real government schemes. Their names, benefits, eligibility criteria, documents, and steps are illustrative only. Each is marked as demo data and unverified. The official links point to the myScheme portal as a starting point; they are not verified scheme-specific application links.

Do not use these records to make eligibility decisions or submit an application. Before adding a real record, an administrator must review its official ministry, state department, India.gov.in, or myScheme source; enter the direct source and application URLs; confirm every criterion and instruction; then record the verification date. The app does not scrape official sites or submit applications.

## Matching and privacy

Matching is deterministic and compares the user's temporary answers with structured criteria only. It never guarantees eligibility. A potential match means the stored criteria did not conflict with the answers; incomplete or uncertain criteria produce “More information needed”; a known conflict produces “Doesn't appear to match.” No questionnaire answers are stored.

The app does not collect Aadhaar numbers, bank details, or exact addresses, and does not require an account. Applications take place on official government websites.

## Catalogue administration

Set `SCHEME_ADMIN_TOKEN` as a Replit Secret before using the protected routes. Send it as `Authorization: Bearer <token>` from an administrator tool. The server compares it without logging or returning the token. If the secret is missing, administration endpoints remain disabled.

Routes under `/api/admin/schemes` support listing records, adding a record, editing fields, deactivating a record, and recording that a human administrator reviewed the official source. `GET /api/admin/schemes?needsReview=true` lists records with no verification date or a date older than one year. Editing criteria does not silently change the verification date; verification is a separate action.

## API overview

- `GET /api/schemes` — search and filter active records with `q`, `category`, `state`, and `governmentLevel`.
- `GET /api/schemes/summary` — catalogue counts and available categories.
- `POST /api/schemes/match` — compare required profile answers with active records.
- `GET /api/schemes/:id` — scheme details.
- `GET/POST /api/admin/schemes` — protected review and creation.
- `PATCH /api/admin/schemes/:id` — protected edits.
- `POST /api/admin/schemes/:id/deactivate` — protected deactivation.
- `POST /api/admin/schemes/:id/verify` — record a verification date after manual review.

All API routes are validated against the OpenAPI contract in `lib/api-spec/openapi.yaml`. Regenerate client and validation types after changing it:

```sh
pnpm --filter @workspace/api-spec run codegen
pnpm run typecheck
```
