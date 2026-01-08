FROM oven/bun:1-alpine AS base
RUN bun install -g turbo@^2.7.2

FROM base AS configs
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

FROM base AS installer
WORKDIR /usr/src/app

COPY package.json bun.lock turbo.json ./
COPY apps/web/package.json ./apps/web/
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

COPY --from=installer /usr/src/app ./
COPY . .
RUN turbo prune web
RUN turbo build --filter=web

FROM configs AS runner
COPY --from=builder /usr/src/app/apps/web/.output/ .

EXPOSE 3000
CMD ["bun", "./server/index.mjs"]


