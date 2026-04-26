# Better Auth Performance Improvement Plan (Redis-Free)

> **Scope:** `api/src/lib/auth.ts` and related auth infrastructure  
> **Goal:** Eliminate unnecessary DB round-trips, reduce session-table write amplification, and make auth resilient under load — **using only Postgres**.  
> **Version target:** `better-auth@^1.5.6`

---

## 1. Current State

| Layer | Current Config |
|-------|----------------|
| **Adapter** | Direct Postgres via Kysely (`pg.Pool`) |
| **Session storage** | Database-only (`authSessions` table) |
| **Cookie cache** | **Disabled** (default) |
| **Secondary storage** | **None** (intentionally unused — requires external KV) |
| **Rate limiting** | Default (`memory` storage, implicit) |
| **Session TTL tuning** | Defaults (`expiresIn: 7d`, `updateAge: ~1d`) |
| **ID generation** | `uuidv7()` via `advanced.database.generateId` |
| **Auth schema check** | Separate `authSchemaOptions` object using `"uuid"` string; runtime `authOptions` uses `uuidv7()` function |

### Hot path analysis

Every authenticated request flows through `userMiddleware` (`api/src/api/user.middleware.ts`), which calls:

```ts
const session = await auth.api.getSession({ headers: c.req.raw.headers });
```

With the current configuration this **always** performs at least one DB query (often two: read session + read user). Under load this becomes the primary bottleneck.

---

## 2. Bottlenecks & Impact

| # | Bottleneck | Impact | Effort |
|---|------------|--------|--------|
| 1 | **No `cookieCache`** | Every request hits Postgres for session + user lookup. | Low |
| 2 | **Default `session.updateAge`** | Session `updatedAt` is refreshed too frequently → write amplification on `authSessions`. | Low |
| 3 | **Missing DB indexes** | `authSessions.expiresAt` not indexed → slow cleanup/scans. `users.email` relies only on `UNIQUE` constraint index. | Low |
| 4 | **Rate limit in memory** | Not shared across instances; lost on restart. | Low |
| 5 | **Dual auth config objects** | `authSchemaOptions` and `authOptions` are out of sync. Maintenance hazard. | Low |
| 6 | **No session cleanup** | Expired sessions accumulate in `authSessions`, causing table bloat over time. | Low |

---

## 3. Design Decisions

### 3.1 No `secondaryStorage`

Better Auth's `secondaryStorage` offloads sessions and rate limits to an external KV store. **We intentionally do not use it.**

Reasoning:
- Adds operational complexity (new service, new failure mode, new monitoring).
- `cookieCache` already eliminates DB reads for the hot path.
- `database` rate-limit storage is sufficient for moderate load and survives restarts.
- All wins are achievable within the existing Postgres-only stack.

### 3.2 Keep `uuidv7()` for auth IDs

We explicitly decided to keep `uuidv7()` for Better Auth's internal ID generation, rather than switching to `"uuid"`.

Reasoning:
- Time-sortable IDs are useful for debugging and log correlation.
- The `uuidv7` package is already a dependency (used heavily in business layer).
- The performance difference is negligible for auth table insert volume.
- Auth IDs are separate from business IDs — no need to unify.

### 3.3 Stale session window on logout

With `cookieCache.maxAge: 300`, a signed-out session remains valid for up to 5 minutes on devices that have a cached cookie. This is an accepted trade-off for a personal budget app with typically one active session per user.

---

## 4. Architecture After This Plan

| Path | DB Queries |
|------|-----------|
| **Hot path** (cached cookie, valid session) | **0** |
| **Warm path** (cache miss, valid session) | **1** (indexed `authSessions.token` lookup) |
| **Rate limit check** | **1** lightweight `rateLimit` table lookup |
| **Session storage** | Postgres for durability + auditability |

---

## 5. Implementation Phases

### Phase 1 — Eliminate Hot-Path DB Queries

#### 1.1 Enable `cookieCache`

The single biggest immediate win. Better Auth embeds a signed session payload directly in the cookie. Valid requests no longer touch the DB until the cache expires.

```ts
session: {
  modelName: "authSessions",
  cookieCache: {
    enabled: true,
    maxAge: 60 * 5, // 5 minutes
  },
  expiresIn: 60 * 60 * 24 * 7, // 7 days
  updateAge: 60 * 60 * 24,     // 1 day — only update DB once per day
}
```

**Caveat:** Custom session fields are **not** cached. If we later add `session.additionalFields`, those will trigger a DB fetch. The default `compact` strategy is used (no explicit config needed).

#### 1.2 Add missing DB indexes

```ts
// authSessions.expiresAt — used by cleanup queries
await db.schema
  .createIndex("authSessions_expiresAt_idx")
  .ifNotExists()
  .on("authSessions")
  .column("expiresAt")
  .execute();

// users.email — explicit index ensures consistent fast lookup
await db.schema
  .createIndex("users_email_idx")
  .ifNotExists()
  .on("users")
  .column("email")
  .execute();
```

> Note: `authSessions.token` already has a `UNIQUE` constraint which Postgres indexes automatically.

#### 1.3 Tune `session.updateAge`

Setting `updateAge: 86400` (1 day) means the `updatedAt` column is only written once per day per session, dramatically reducing write load.

#### 1.4 Collapse to a single `authOptions` config

Remove the separate `authSchemaOptions` object. Use a single `authOptions` with `uuidv7()` for both runtime and schema checks. Verified: `getMigrations` does not call `generateId`, so a function value is safe in the config passed to schema checks.

```ts
export const authOptions = {
  ...authBaseOptions,
  advanced: {
    database: {
      generateId: () => uuidv7(),
    },
  },
} satisfies BetterAuthOptions;

export const auth = betterAuth(authOptions);
```

Update `checkAuthSchema.ts` to import `authOptions` instead of `authSchemaOptions`.

#### 1.5 Configure rate limiting for production only

Switch to `database` storage. Only enable in production to avoid interfering with local development and E2E tests.

```ts
rateLimit: {
  enabled: process.env.NODE_ENV === "production",
  window: 60,     // 1 minute
  max: 30,        // 30 requests per window per IP
  storage: "database",
}
```

This creates a `rateLimit` table automatically. Better Auth manages the schema.

---

### Phase 2 — Database Resilience & Cleanup

#### 2.1 Keep default connection pool

Default `pg.Pool` (`max: 10`) is sufficient after `cookieCache` eliminates the hot-path DB query. No tuning needed.

#### 2.2 Add application-level session cleanup

Create `api/src/lib/session-cleanup.ts` with a `setInterval` that deletes expired sessions every 6 hours. Skip in test environment to avoid test pollution.

```ts
if (process.env.NODE_ENV !== "test") {
  setInterval(async () => {
    await db
      .deleteFrom("authSessions")
      .where("expiresAt", "<", new Date())
      .execute();
  }, 6 * 60 * 60 * 1000);
}
```

Import and invoke in `api/src/index.ts`.

#### 2.3 Verify `authSessions` table health

Ensure the table has:
- `ON DELETE CASCADE` on `userId` (already present in migration 0010)
- Proper `NOT NULL` constraints (already present)
- No bloat from excessive `UPDATE` traffic (mitigated by `updateAge` tuning in Phase 1)

---

### Phase 3 — Advanced Optimizations

#### 3.1 Cache-busting strategy

Document how to invalidate all sessions without external KV:

- Bump `session.cookieCache.version` (e.g., `version: 2`) — forces re-auth for all users.
- To invalidate a single user, delete their session row(s) from `authSessions`; the cookie cache will fall through to the DB, find nothing, and reject the request.

#### 3.2 Monitoring hooks (optional)

Add lightweight database hooks to emit metrics:

```ts
databaseHooks: {
  session: {
    create: {
      after: async () => {
        // metrics.increment("auth.session.created")
      },
    },
    delete: {
      after: async () => {
        // metrics.increment("auth.session.deleted")
      },
    },
  },
}
```

#### 3.3 Middleware-level observability

`userMiddleware` currently catches all errors as 401. Ensure we don't double-log or leak stack traces in production. Consider adding a request-level timer around `getSession` to detect regressions.

---

## 6. Migration & Rollback Plan

| Step | Action | Rollback |
|------|--------|----------|
| 1 | Run Phase 1 indexes migration | Drop indexes |
| 2 | Deploy Phase 1 config (cookieCache, updateAge, rateLimit, unified config) | Revert `auth.ts` |
| 3 | Verify `auth:check-schema` passes | N/A |
| 4 | Deploy Phase 2 (cleanup strategy) | Remove cleanup import from `index.ts` |
| 5 | Monitor `authSessions` table size | Adjust cleanup frequency |

---

## 7. Acceptance Criteria

- [ ] `auth.api.getSession()` on a warm cookie does **zero** DB queries.
- [ ] `session.updateAge` set to `86400` reduces `authSessions` write volume by >80%.
- [ ] Rate limits survive API process restart (via `database` storage).
- [ ] `authSessions` table size stays bounded (cleanup removes expired rows).
- [ ] `pnpm auth:check-schema` passes after config consolidation.
- [ ] E2E tests pass (`api/src/app.e2e.test.ts` and related).

---

*Plan created: 2026-04-26*  
*Next step: Proceed to implementation.*
