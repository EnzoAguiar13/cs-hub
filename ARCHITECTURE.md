# Architecture

CS Hub is a pnpm/Turborepo workspace split into three layers:

- `apps/web`: authenticated Next.js operations workspace. It consumes the API
  through a typed client and shares contracts with the backend.
- `apps/api`: NestJS HTTP API. It organizes business capabilities by module,
  keeps persistence behind Prisma repositories, and exposes the application
  through authentication, authorization and validation boundaries.
- `packages/shared-types`: Zod-backed request and response contracts shared by
  the web and API applications.

The API persists to PostgreSQL through Prisma. The domain areas represented in
the code include campaigns, creators, contracts, deals, deliveries, finance,
notifications, withdrawals and AI-assisted operations. The dashboard is a
cross-cutting read model; the remaining modules use repository abstractions for
their persistence operations.

## Runtime boundaries

The web application holds the authenticated workspace experience. The API
enforces JWT authentication, role/permission checks, request validation and a
global throttling guard. Refresh tokens are handled through HTTP cookies. The
repository is intentionally documented as a portfolio sample and does not
include a hosted environment or production data.

## Verification path

Use the commands in the README in this order: install dependencies, generate
the Prisma client, run lint/typecheck/unit tests, build both applications, and
run API e2e tests against the disposable Testcontainers database.
