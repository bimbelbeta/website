FROM oven/bun:1-alpine AS base
RUN bun install -g turbo@^2.7.2

FROM base AS configs
ENV NODE_ENV=production \
  PORT=3001 \
  HOSTNAME="0.0.0.0" \
  BETTER_AUTH_URL=https://api.bimbelbeta.id

FROM base AS installer
WORKDIR /usr/src/app

COPY package.json bun.lock turbo.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/api/package.json ./packages/api/
COPY packages/auth/package.json ./packages/auth/
COPY packages/config/package.json ./packages/config/
COPY packages/db/package.json ./packages/db/

RUN bun install

FROM configs AS builder
ARG TURBO_TEAM
ARG TURBO_TOKEN
ENV TURBO_TEAM=${TURBO_TEAM}
ENV TURBO_TOKEN=${TURBO_TOKEN}
WORKDIR /usr/src/app

COPY --from=installer /usr/src/app/ .
COPY . .
RUN turbo prune server
RUN turbo build --filter=server

FROM configs AS runner
COPY --from=builder /usr/src/app/apps/server/dist/ .

EXPOSE 3001
CMD ["bun", "./index.js"]
