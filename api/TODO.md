# Better Auth Performance TODO (Redis-Free)

## Phase 1 – Eliminate Hot-Path DB Queries

### 1.1 Enable `cookieCache`
- [x] Update `api/src/lib/auth.ts`
  - Add `session.cookieCache: { enabled: true, maxAge: 300 }`
  - Set `session.expiresIn: 604800` (7 days)
  - Set `session.updateAge: 86400` (1 day)
- [x] Confirm `cookieCache` strategy remains default `compact` (no explicit config needed)

### 1.2 Add missing DB indexes
- [x] Create migration `api/src/db/migrations/0013_auth_perf_indexes.ts`
  - `authSessions.expiresAt` index
  - `users.email` index
- [x] Add `down()` migration to drop indexes
- [x] Run `cd api && pnpm migrate` locally

### 1.3 Tune `session.updateAge`
- [x] Confirm `updateAge: 86400` is set in `authOptions` (part of 1.1)

### 1.4 Collapse to a single `authOptions` config
- [x] Update `api/src/lib/auth.ts`
  - Remove `authSchemaOptions` object
  - Keep `uuidv7()` in `advanced.database.generateId`
  - Export single `authOptions` used by both runtime and schema checks
- [x] Update `api/src/db/checkAuthSchema.ts` to import `authOptions` instead of `authSchemaOptions`
- [x] Verify `uuidv7` package remains in dependencies (used in business layer too)

### 1.5 Configure rate limiting for production only
- [x] Update `api/src/lib/auth.ts`
  - Add `rateLimit: { enabled: process.env.NODE_ENV === "production", window: 60, max: 30, storage: "database" }`
- [x] Update `api/src/db/checkAuthSchema.ts` to account for new `rateLimit` table
- [x] Run `cd api && pnpm auth:check-schema`

### 1.6 Phase 1 verification
- [ ] `cd api && pnpm build` passes (pre-existing TS errors in unrelated test files)
- [x] `cd api && pnpm auth:check-schema` passes
- [x] `cd api && pnpm test:e2e` passes (70/71; 1 pre-existing failure)
- [x] `cd api && pnpm dev` starts without errors (module load verified)

---

## Phase 2 – Database Resilience & Cleanup

### 2.1 Keep default connection pool
- [x] Confirm `pg.Pool` in `api/src/db/database.ts` uses defaults (no changes needed)

### 2.2 Add application-level session cleanup
- [x] Create `api/src/lib/session-cleanup.ts`
  - `setInterval` every 6 hours
  - Delete from `authSessions` where `expiresAt < NOW()`
  - Guard with `process.env.NODE_ENV !== "test"`
- [x] Import and invoke in `api/src/index.ts`
- [x] Ensure cleanup query is safe and idempotent

### 2.3 Verify `authSessions` table health
- [x] Confirm `ON DELETE CASCADE` on `userId` is active (existing from 0010)
- [x] Confirm `NOT NULL` constraints are present (existing from 0010)
- [ ] Check for index usage with `EXPLAIN` on session lookup query (deferred to production monitoring)

### 2.4 Phase 2 verification
- [ ] `cd api && pnpm build` passes (pre-existing TS errors)
- [x] `cd api && pnpm test:e2e` passes
- [x] `docker compose up` brings up API + Postgres cleanly (no new services needed)

---

## Phase 3 – Advanced Optimizations

### 3.1 Cache-busting strategy
- [ ] Document session invalidation procedure (bump `session.cookieCache.version`)
- [ ] Document per-user invalidation (delete from `authSessions`)
- [ ] Document 5-minute stale window on logout (accepted trade-off)

### 3.2 Monitoring hooks (optional)
- [ ] Add `databaseHooks` to `authOptions` for session create/delete metrics
- [ ] Ensure hooks don't add latency to the request path

### 3.3 Middleware-level observability
- [ ] Verify `userMiddleware` doesn't leak stack traces in production
- [ ] Consider adding request-level timing around `getSession`

### 3.4 Phase 3 verification
- [ ] Load test or simulate concurrent requests
- [ ] Confirm zero DB queries on cached session hits
- [ ] Confirm `authSessions` write volume drop
- [ ] Confirm `authSessions` table size stays flat over time

---

## Cross-cutting tasks

- [ ] Update `api/PLAN.md` if decisions change during implementation
- [ ] Update `docs/DEVELOPMENT.md` with cleanup strategy notes
- [ ] Verify `web/src/lib/auth-client.ts` remains compatible with all changes
- [ ] Confirm no `secondaryStorage` or Redis references remain in the codebase
