# Local development setup

This document is for **humans and AI coding agents**. It describes how to run the Budget app locally: Postgres, API (`api/`), and web (`web/`).

## Repository layout

| Path   | Stack                                      | Package manager |
|--------|--------------------------------------------|-----------------|
| `api/` | Hono, Better Auth, Kysely, Postgres        | pnpm (own `package.json`) |
| `web/` | Vite, React 19, TanStack Router/Query/DB   | pnpm (own `package.json`) |

There is **no** root `pnpm-workspace.yaml`. Dependencies are installed **per package** (`api` and `web` separately). The root `package.json` only pins **`pnpm@10.32.1`** via `packageManager`.

Shared TypeScript contracts are **not** a separate npm package in this checkout. `api/scripts/build-schemas.mjs` copies `api/src/schemas.ts` → `web/src/lib/schemas.ts` when you run API `predev` / `build:schemas`.

## Prerequisites

- **Node.js** — use a current LTS; the API targets Node-friendly ESM (`tsx`, `type: "module"`).
- **pnpm** — use the version from the repo root: `pnpm@10.32.1` (Corepack: `corepack enable && corepack prepare pnpm@10.32.1 --activate`).
- **Docker** (optional but typical) — for local Postgres via `docker compose`.

## 1. Install dependencies

```bash
cd api && pnpm install
cd ../web && pnpm install
```

## 2. Start Postgres

From the **repository root**:

```bash
docker compose up postgres
```

Compose defines:

- **Database:** `budget`
- **User / password:** `postgres` / `postgres`
- **Port:** `5432`

**Local connection URL** (matches `docker-compose.yml`):

`postgresql://postgres:postgres@localhost:5432/budget`

To run **API + Postgres** in containers (not required for day-to-day frontend work):

```bash
docker compose up
```

**Note:** `api/Dockerfile` may still assume an older monorepo layout; prefer running the API with `cd api && pnpm dev` for local development unless you have verified the image build.

## 3. Configure the API (`api/.env`)

The API loads env from **`api/.env`** (`tsx --env-file=.env` in `api/package.json` scripts).

Create `api/.env` (do not commit real secrets). Required fields are validated in `api/src/env.ts`:

| Variable              | Required | Purpose |
|-----------------------|----------|---------|
| `DATABASE_URL`        | Yes      | Postgres URL (see above) |
| `BETTER_AUTH_SECRET`  | Yes      | Better Auth secret (use a long random string in dev) |

Optional:

| Variable                       | Purpose |
|--------------------------------|---------|
| `BETTER_AUTH_URL`              | Explicit auth base URL, e.g. `http://localhost:3000` |
| `CORS_ALLOWED_ORIGINS`         | Comma-separated extra allowed origins |
| `OPENAI_API_KEY` or `OPEN_AI_API_KEY` | Chat and bulk transaction features |
| `OPENAI_BULK_TRANSACTIONS_MODEL` | Optional model override for bulk import |

**Minimal example** `api/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/budget
BETTER_AUTH_SECRET=replace-with-long-random-secret
```

## 4. Migrate (and optional seed)

```bash
cd api && pnpm migrate
cd api && pnpm seed
```

Verify Better Auth tables if you change auth-related schema:

```bash
cd api && pnpm auth:check-schema
```

## 5. Regenerate web schemas (when `api/src/schemas.ts` changes)

Either start the API dev server (runs `predev` → `build:schemas`) or:

```bash
pnpm --dir api build:schemas
```

## 6. Run dev servers

Use **two terminals**.

**API** (default **http://localhost:3000**, all HTTP routes under **`/api`**):

```bash
cd api && pnpm dev
```

**Health check:** `GET http://localhost:3000/api/health` → `OK!`

**Web** (Vite default **http://localhost:5173**):

```bash
cd web && pnpm dev
```

`web/vite.config.ts` proxies **`/api`** to `VITE_API_BASE_URL` if set, otherwise **`http://localhost:3000`**. The Better Auth client in dev typically uses same-origin `/api/auth` via that proxy.

## 7. Production build notes (web)

Production builds expect **`VITE_API_BASE_URL`** set to the API’s public origin. In local dev, the Vite proxy avoids needing it for same-origin `/api` calls.

## 8. Common commands reference

| Task        | Command |
|------------|---------|
| API dev    | `cd api && pnpm dev` |
| API build  | `cd api && pnpm build` |
| Migrations | `cd api && pnpm migrate` |
| API e2e tests | `cd api && pnpm test:e2e` (uses `NODE_ENV=test`; do not point at a production DB) |
| Web dev    | `cd web && pnpm dev` |
| Web build  | `cd web && pnpm build` |
| Web lint   | `cd web && pnpm lint` |

## 9. Troubleshooting (for agents)

- **API fails on startup with env validation errors** — Ensure `api/.env` exists and `DATABASE_URL` is a full URL and `BETTER_AUTH_SECRET` is non-empty.
- **Cannot connect to DB** — Confirm `docker compose up postgres` is running and port `5432` is free.
- **Auth / CORS issues from a non-5173 origin** — `api/src/lib/auth.ts` trusts `http://localhost:5173` by default; add origins via `CORS_ALLOWED_ORIGINS` or `BETTER_AUTH_URL` as needed.
- **Web types out of sync with API contracts** — Run `pnpm --dir api build:schemas` after editing `api/src/schemas.ts`.
- **TanStack Router route tree** — `web/src/routeTree.gen.ts` is generated by the Vite plugin during `pnpm dev` / `pnpm build`; do not edit by hand.

For architecture and editing conventions, see **`AGENTS.md`** at the repo root.
