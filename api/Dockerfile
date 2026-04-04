FROM node:22-alpine AS base

RUN apk add --no-cache gcompat
RUN corepack enable

WORKDIR /app

FROM base AS deps

COPY api/package.json api/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder

COPY api/tsconfig.json ./tsconfig.json
COPY api/scripts ./scripts
COPY api/src ./src

RUN pnpm build

FROM base AS prod-deps

COPY api/package.json api/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=prod-deps --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=hono:nodejs /app/package.json ./package.json
COPY --from=builder --chown=hono:nodejs /app/dist ./dist

USER hono
EXPOSE 3000

CMD ["node", "dist/index.js"]
