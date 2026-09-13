# CS Hub

Customer-success operations hub for campaigns, creators, contracts, deals,
deliveries, finance and withdrawals. The repository is a full-stack monorepo:
an authenticated Next.js workspace, a NestJS API and shared TypeScript
contracts.

## Engineering focus

- role-based access and workspace boundaries;
- typed API contracts shared by web and backend;
- PostgreSQL persistence with Prisma;
- operational workflows for creator files, deals, deliveries and withdrawals;
- unit tests plus isolated PostgreSQL e2e coverage through Testcontainers.

## Quality gates

```bash
pnpm install --frozen-lockfile
pnpm --filter @cs-hub/api prisma:generate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @cs-hub/api test:e2e
```

The last command requires Docker and creates its own disposable database. CI
runs the same checks in `.github/workflows/ci.yml`.

## Repository map

```text
apps/api       NestJS API, Prisma schema and e2e tests
apps/web       Next.js operations workspace
packages       shared configuration and types
docs           architectural notes and working references
```

Read the [architecture](ARCHITECTURE.md) and [security](SECURITY.md) notes
before running the sample locally.

This is a portfolio-ready engineering sample, not a claim that a hosted demo
or production customer data is available. Credentials and real creator data
must remain outside the repository. No open-source license is granted; reuse
requires the author's permission.
