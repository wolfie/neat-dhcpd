FROM node:20.11.1-alpine AS base
RUN corepack enable pnpm
RUN apk add git

FROM base AS deps
WORKDIR /app
COPY .nvmrc package.json pnpm-lock.yaml pnpm-workspace.yaml start* tsconfig.base.json ./
COPY .git ./.git
COPY packages ./packages
RUN pnpm install
RUN pnpm build

FROM deps AS build
WORKDIR /build
COPY --from=deps \
  /app/.nvmrc \
  /app/package.json \
  /app/pnpm-lock.yaml \
  /app/pnpm-workspace.yaml \
  /app/start.js \
  /app/start.waitOnDb.js \
  /app/startWithAuthbind.sh \
  ./
RUN mkdir -p \
  ./packages/common \
  ./packages/db \
  ./packages/dhcpd \
  ./packages/litel \
  ./packages/web-ui

COPY --from=deps /app/packages/common/build ./packages/common/build
COPY --from=deps /app/packages/common/package.json ./packages/common

COPY --from=deps /app/packages/litel/build ./packages/litel/build
COPY --from=deps /app/packages/litel/package.json ./packages/litel

COPY --from=deps /app/packages/db/build ./packages/db/build
COPY --from=deps /app/packages/db/package.json ./packages/db
COPY --from=deps /app/packages/db/.env ./packages/db/.env

COPY --from=deps /app/packages/dhcpd/build ./packages/dhcpd/build
COPY --from=deps /app/packages/dhcpd/.env ./packages/dhcpd/.env
COPY --from=deps /app/packages/dhcpd/package.json ./packages/dhcpd/package.json

COPY --from=deps /app/packages/web-ui/build ./packages/web-ui/build
COPY --from=deps /app/packages/web-ui/.env ./packages/web-ui/.env
COPY --from=deps /app/packages/web-ui/package.json ./packages/web-ui/package.json
COPY --from=deps /app/.git ./.git
RUN echo "GIT_COMMIT_SHA=$(git rev-parse HEAD)" >> ./packages/web-ui/.env
RUN rm -rf .git

FROM build AS bundle
WORKDIR /
RUN tar -czf build.tar.bz2 build

CMD ["npx", "-y", "serve", "."]
