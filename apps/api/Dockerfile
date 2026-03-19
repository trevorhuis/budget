FROM node:22-alpine AS base

FROM base AS builder

RUN apk add --no-cache gcompat
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/tsconfig.json ./apps/api/
COPY packages/schemas/package.json packages/schemas/tsconfig.json ./packages/schemas/
COPY apps/api/src ./apps/api/src
COPY packages/schemas/index.ts ./packages/schemas/index.ts

RUN pnpm install --frozen-lockfile
RUN pnpm --filter schemas build
RUN pnpm --filter api build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono
RUN corepack enable

COPY --from=builder --chown=hono:nodejs /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/
COPY --from=builder --chown=hono:nodejs /app/apps/api/package.json /app/apps/api/package.json
COPY --from=builder --chown=hono:nodejs /app/packages/schemas/package.json /app/packages/schemas/package.json

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder --chown=hono:nodejs /app/apps/api/dist /app/apps/api/dist
COPY --from=builder --chown=hono:nodejs /app/packages/schemas/dist /app/packages/schemas/dist

USER hono
EXPOSE 3000

CMD ["node", "/app/apps/api/dist/index.js"]
