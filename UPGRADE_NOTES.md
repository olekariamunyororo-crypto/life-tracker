# Phase 1 Upgrade — Implementation Notes

This branch implements the Phase 1 roadmap from `Life-Tracker Upgrade Plan` plus the
schema groundwork for Phase 2/3. Everything below was implemented, type-checked,
tested and built in this repository.

## Stack upgrade

| Area | Before | After |
| --- | --- | --- |
| Framework | Next.js 14.1.0 | Next.js **15.5.29** |
| UI runtime | React 18.2 | React **19.3.1** |
| ORM | Prisma 5.10 | Prisma **6.19.3** (client regenerated) |
| Validation | manual `parseFloat`/`parseInt` | **Zod 3.25** schemas shared by server + form |
| Forms | custom `useFormState` + `useLocalStorage` | **React Hook Form 7.92** + `@hookform/resolvers` |
| Mutations | REST route handlers | **Server Actions** (`src/app/actions/dailyEntry.ts`) + `revalidatePath` |
| Data fetching | per-file `new PrismaClient()` | singleton `src/lib/db.ts` + repository `src/lib/repositories/dailyEntry.ts` |
| Client cache | manual refetch | **TanStack Query 5.108** (provider in `AppProviders`) |
| UI kit | custom + Headless UI | **shadcn-style components** (`components/ui/*`, cva + Radix slot) |
| Auth | none | `src/lib/auth.ts` — Clerk when env keys are set, stable dev user otherwise |
| Dark mode | none | `next-themes` (class strategy, system default, toggle in Navbar) |
| PWA | none | `src/app/manifest.ts` + generated icons (`public/icons/`) |
| Tests | 1 ad-hoc script | **Vitest** (`npm test`) — 22 tests over calculations, strength standards and schemas |

## What changed, by area

**Data layer (PR-2/3/7)**
- `src/lib/db.ts` — Prisma singleton; `new PrismaClient()` exists nowhere else.
- `src/lib/repositories/dailyEntry.ts` — every read/write is scoped by `userId`;
  create/update use nested writes; delete is now **soft** (`deletedAt`).
- `prisma/schema.prisma` — new `User`, user-defined `Supplement` (replaces the
  hard-coded creatine/vitamin_c/vitamin_d strings), `Goal` model; `DailyEntry`
  gains `userId`, `deletedAt`, `sleepHours`, `sleepQuality`, `mood`, `energy`, `notes`;
  `SupplementLog` now references `Supplement` by FK.
- `prisma/migrations/20251121000000_phase1_upgrade/` — hand-written SQL that
  backfills the dev user and converts existing `supplement_name` rows into
  `Supplement` records. `@@map` names for existing tables are unchanged, so no
  dump/restore is needed. Run with `npm run db:migrate` (needs a Postgres URL).
- `prisma/seed.js` — idempotent: dev user, default supplements, default goals,
  sample entry.

**Validation + actions (PR-3/4)**
- `src/lib/schemas/dailyEntry.ts` — one contract for both sides: the *form schema*
  (string inputs → typed output, range-checked) and the *server schema* (coercing,
  used by the Server Action and the REST routes). The old `string | number` drift
  between `EntryRequestData` and `DailyEntryFormData` is gone.
- `src/app/actions/dailyEntry.ts` — `saveDailyEntry(values, id?)` +
  `deleteDailyEntry(id)`; both validate, scope by user and revalidate
  `/dashboard` and `/`.
- The REST endpoints remain as thin wrappers (`/api/daily-entry`, `/api/daily-entry/[id]`)
  for non-browser clients, now schema-validated and user-scoped. Next 15's async
  `params` are awaited in the `[id]` handlers.

**Form (PR-5)**
- `DailyEntryForm` runs on React Hook Form with `zodResolver`; sections receive the
  form instance (register/watch/setValue) instead of bespoke handler props.
- Offline draft persists to localStorage on every keystroke (create mode) and is
  restored on mount; today's date is set client-side to avoid hydration mismatch
  (the `ssr: false` `ClientForm` wrapper is deleted).
- Phase 2 groundwork: **presets** (Rest day / Office + gym / Travel), **sleep &
  recovery** section (hours, quality, mood, energy, notes), **user-defined
  supplements** (fetch via `getSupplements()` action, inline "Add your own").

**UI / platform (PR-6/8/10)**
- `src/app/layout.tsx` is a **Server Component** again; metadata + viewport are
  exported from it (the dead `src/app/metadata.ts` is removed). `AppShell` (client)
  owns the pathname-dependent chrome.
- shadcn-style `button`, `input`, `label`, `textarea`, `card`, `checkbox` +
  `components.json` so future `shadcn add` calls work.
- Dark mode via `next-themes` (class strategy) with a `ThemeToggle` in the Navbar;
  the dashboard cards intentionally stay light on the dark canvas.
- PWA manifest (`/manifest.webmanifest`) + icons generated into `public/icons/`.

**Dashboard (PR-9)**
- `EntryViewer` deletes through the Server Action wrapped in a TanStack Query
  mutation; `router.refresh()` re-renders the server dashboard.
- Fixed a real pre-existing bug: `EntryViewerContainer` called `useState` after an
  early return (rules-of-hooks violation); the index is now unconditional and
  clamped after deletions.
- `SupplementList` reads `supplement.name` from the new relation.

## How to run

```bash
npm install
cp .env.example .env.local          # set POSTGRES_DATABASE_URL
npx prisma migrate deploy           # or: npm run db:migrate (dev)
npm run db:seed
npm run dev                         # http://localhost:3000
npm test                            # Vitest (22 tests, no DB needed)
npm run build                       # verified green on this branch
```

Optional Clerk:

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

When both are present, the signed-in Clerk user is the only identity and a `user`
row is provisioned on first request; `src/middleware.ts` gates every route. When
they are unset, the stable `local-dev-user` is used **only outside production**;
in production the app fails closed (HTTP 503) so a misconfigured deploy can never
expose one person's data. See "Security audit & dependency upgrades" below, and
`docs/development/deployment.md` for the one-time SQL to claim pre-auth rows
under your Clerk id.

## Known limitations / follow-ups

- **Playwright e2e** from the plan is not included: it needs a running Postgres.
  The Vitest suite covers the pure data-layer logic; add e2e once a dev DB exists.
- The legacy `scripts/test-data-flow.ts` + `scripts/test-cases.ts` harnesses were
  deleted by the security audit (they targeted the old `supplementName` columns);
  `npm test` (Vitest, 69 tests) is the replacement.
- `docs/` predates the refactor in places (it documents `EntryRequestData`, the
  client root layout and the old REST-only flow).
- Goals are seeded but not yet surfaced in the UI (Phase 3), and no weekly
  summary/correlation cards yet (Phase 3), and CSV/wearable/Telegram integrations
  are untouched (Phase 4).
- Tailwind stays on 3.4 by design; the Tailwind 4 migration is deliberately
  deferred so it can be done in isolation.

## Security audit & dependency upgrades (applied)

Two follow-up patches were applied on top of Phase 1 (commits `f38748e` and
`906c29b`); both verified with `npm test` (69/69), `tsc`, `next lint`, `next build`.

### Security & correctness audit

- **Fail-closed auth.** `src/lib/auth.ts` exports `AuthError`; with Clerk
  configured a signed-out request is rejected (401) and a Clerk error propagates
  instead of falling back to the dev user. With Clerk unset the dev user is used
  only outside production — in production the app returns 503. First-request user
  provisioning is race-safe (handles Prisma `P2002`).
- **Route-handler guards.** `src/lib/api-guard.ts`: `assertSameOrigin` (CSRF
  defence for cookie-authenticated browsers), `readJsonBody` (content-type check
  + 64 KB cap → 413/415/400), `toErrorResponse` (maps `AuthError`/`HttpError`/
  `LimitError` to safe statuses; hides internal details behind a generic 500).
  All REST routes use them.
- **Server Action arg validation.** Action params are typed `unknown` and
  validated: `entryIdSchema` (cuid-like, rejects path traversal / over-long ids)
  on `id` args; `typeof` check on supplement names.
- **Schema hardening.** Supplement names trimmed + length-capped; the supplement
  map size-capped (`MAX_SUPPLEMENTS_PER_ENTRY = 50`); entry dates range-checked
  (no `1970` / `2999`); the form date field requires `YYYY-MM-DD`.
- **Per-user caps.** `LimitError` + `MAX_SUPPLEMENTS_PER_USER = 50` in the
  repository (constant-query-count, race-safe `createMany({ skipDuplicates })`).
- **Ownership re-asserted on write.** `updateEntry` re-checks `userId` +
  `deletedAt` on the `update` itself (no check-then-act gap) and maps Prisma
  `P2025` to `null`. `softDeleteEntry` is a single conditional `updateMany`
  (atomic, IDOR-safe). Gym-exercise rows are deleted before their `RESTRICT`-FK
  session.
- **Timezone-safe dates.** `src/lib/dates.ts` (`calendarDay`, `toDateKey`) —
  entries are day-granular stored at UTC midnight; viewer/`date-fns` calls now
  read the calendar day directly, so west-of-UTC users no longer see the previous
  day or drift on edit.
- **Bug fixes caught by tests.** `calculateCurrentStreaks` now counts consecutive
  hits back from the most recent entry and stops at the first miss (old code
  reported the run at the oldest end of the window); weekly-overview
  ordering/labels use the entry's own date, not `createdAt`; `Array#sort` calls on
  props are copied first; `calculateOneRepMax` is hardened (finite check, clamps
  reps to 36, 0 for invalid sets) and de-duplicated into `src/lib/calculations`.
- **Hardening config.** `next.config.js` adds security headers (`nosniff`,
  `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'`, Referrer-Policy,
  Permissions-Policy, HSTS), `reactStrictMode`, `poweredByHeader: false`, a 100 KB
  server-action body limit. `src/middleware.ts` is the Clerk gatekeeper (public
  manifest/icons only). `package.json` gains `postinstall: prisma generate` +
  `engines.node >=18.18`.
- **FK indexes.** `prisma/migrations/20251122000000_audit_indexes/` indexes
  `gym_exercise.sessionId` and `supplement_log.supplementId` (Postgres does not
  index FK columns automatically). Run `npx prisma migrate deploy`.
- **Docs.** `docs/development/deployment.md` covers production build steps, the
  required Clerk keys, and the one-time SQL to reassign pre-auth rows to your
  Clerk id.

### Dependency upgrades

- `zod` 3 → **4.6.7**, `@hookform/resolvers` 3 → **5**, `vitest` 3 → **5**,
  `@types/node` 20 → **22**. The form uses React Hook Form's three-generic
  `useForm<Input, Context, Output>` typing so schemas with transforms flow
  through `zodResolver` correctly. `prisma` + `@prisma/client` kept aligned at
  6.19.3 (`npm audit fix` had downgraded the prisma CLI to 6.12.0 over a
  dev-tooling transitive advisory; the CLI was matched back to the runtime
  client).

Before deploying after these patches: set the Clerk keys, run
`npx prisma migrate deploy` (adds the two FK indexes), and (first sign-in only)
run the data-claim SQL in `docs/development/deployment.md`.
