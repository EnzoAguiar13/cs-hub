# Security

This repository is a public portfolio sample. Do not commit credentials,
OAuth secrets, refresh tokens, real creator/customer information, database
exports or production configuration.

## Controls represented in the code

- JWT-protected API routes with explicit public-route exceptions;
- role and permission checks with workspace-aware access boundaries;
- Zod request validation at controller boundaries;
- Helmet security headers and configured CORS;
- HTTP-only refresh-token cookies;
- global request throttling plus stricter protection on authentication flows;
- Prisma-managed database access and disposable Testcontainers e2e coverage.

## Reporting

Do not open a public issue with a vulnerability or any sensitive material.
Contact the repository owner privately through GitHub and include a minimal
reproduction, affected area and proposed mitigation.

There is no open-source license granted by this repository. Its public
visibility is for portfolio review; reuse or redistribution requires the
author's permission.
