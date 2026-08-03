# AISAF

Cosmetics e-commerce monorepo (Next.js storefront + Express API + shared Zod schemas).

Specs: `prd.md` · `arc.md` · `rules.md` · `design.md`

## Workspaces

| Package | Path | Role |
|---|---|---|
| `@aisaf/web` | `apps/web` | Next.js App Router storefront + admin shells |
| `@aisaf/api` | `apps/api` | Express API (routes → controller → service → repository) |
| `@aisaf/shared` | `packages/shared` | Zod schemas, types, typed API client |
| `@aisaf/config` | `packages/config` | Shared TypeScript base config |

## Phase 1 status

- Monorepo scaffold
- Prisma schema + initial migration
- Auth: register/login API + NextAuth (credentials / JWT)
- Product catalog listing + product detail
- Design tokens wired (Tailwind + CSS variables)
- Service-layer unit tests (auth tokens, product mapper)

## Prerequisites

- Node.js 20+
- PostgreSQL 16+ (local or Docker)

```bash
# If you have Docker:
docker compose up -d postgres
```

Copy env files from `.env.example` (dev defaults already live in `apps/api/.env` and `apps/web/.env.local` — change secrets before any shared environment).

## Setup

```bash
npm install
npm run db:generate
npm run db:migrate -w @aisaf/api   # applies migrations (needs Postgres)
npm run db:seed -w @aisaf/api
```

Seeded users (password `Password123!`):

- `admin@aisaf.local` (ADMIN)
- `customer@aisaf.local` (CUSTOMER)

## Develop

```bash
npm run dev:api    # http://localhost:4000
npm run dev:web    # http://localhost:3000
```

## Test

```bash
npm run test -w @aisaf/api
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev:web` / `dev:api` | Start web or API |
| `npm run db:generate` | Prisma client |
| `npm run db:migrate -w @aisaf/api` | Run migrations |
| `npm run db:seed -w @aisaf/api` | Seed sample catalog + users |
| `npm run test -w @aisaf/api` | Vitest service tests |
