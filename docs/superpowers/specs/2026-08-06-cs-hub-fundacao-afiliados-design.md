# CS Hub — Fase 1: Fundação + Módulo Afiliados/Creators

Data: 2026-08-06
Status: Aprovado

## Contexto

CS Hub é um ERP/CRM completo para gestão de Customer Success, Afiliados, Influenciadores,
Financeiro, Entregas e Performance no mercado de iGaming, com um agente de IA. O escopo
total (>20 subsistemas: Afiliados, Deals, Financeiro, Tráfego, Redes Sociais, Entregas,
Exclusividade, Contratos, Calendário, Campanhas, Biblioteca, Relatórios, IA, Notificações
multi-canal) é grande demais para um único spec/plano de implementação. Este documento
cobre apenas a **Fase 1**: a fundação
técnica do sistema e o primeiro módulo de negócio (Afiliados/Creators), base da qual todos
os módulos futuros dependem. Cada módulo subsequente terá seu próprio ciclo spec → plano →
implementação.

## Decisões de escopo

- Projeto de produção desde o início (Clean Architecture, testes, CI), não um protótipo descartável.
- Ambiente desta fase: desenvolvimento local via Docker Compose. Deploy real (AWS/Cloudflare)
  fica para uma fase futura, quando houver infra provisionada.
- Google OAuth implementado de forma real (usuário já possui Client ID/Secret; entram via `.env`).
- Upload de arquivos via MinIO local (S3-compatível), para troca trivial por S3/R2 em produção.
- RBAC com 7 roles fixos + overrides de permissão individuais por usuário (GRANT/DENY).
- Perfil de Creator: cadastro 100% completo (todos os campos solicitados) + timeline + upload
  de arquivos/contratos já nesta fase. Abas de financeiro/campanhas/entregas ficam como
  placeholders "em breve", prontas para plugar quando os módulos correspondentes existirem.

## Fora de escopo (fases futuras)

Deals, Financeiro, Entregas, Campanhas, Redes Sociais (métricas), Contratos/Exclusividade,
Calendário, Biblioteca de criativos, Relatórios/exportação, Agente de IA, Notificações
multi-canal (email/Telegram/WhatsApp/Slack/Discord).

## Arquitetura

### Monorepo

pnpm workspaces + Turborepo.

```
cs-hub/
  apps/
    web/      # Next.js 15 (App Router)
    api/      # NestJS
  packages/
    shared-types/   # Zod schemas / DTOs compartilhados entre web e api
    ui/             # componentes Shadcn compartilhados (cresce nas fases futuras)
    config/         # eslint/tsconfig base compartilhados
  docker-compose.yml
```

### Backend — Clean Architecture por módulo

Cada módulo de negócio (`creators` nesta fase; `deals`, `financeiro`, etc. nas próximas)
segue a mesma estrutura interna:

```
apps/api/src/modules/creators/
  domain/           # entidades, value objects, regras de negócio puras, interfaces de repositório
  application/       # use-cases (CreateCreator, UpdateCreator, ListCreators, UploadCreatorFile...)
  infrastructure/    # implementação Prisma do repositório, adapter MinIO
  presentation/       # controllers Nest, DTOs de entrada/saída, guards/decorators de permissão
```

Repository pattern: interface no `domain`, implementação no `infrastructure` — permite trocar
Prisma por outra fonte sem tocar regra de negócio. Eventos de domínio (ex: `CreatorCreated`,
`CreatorFileUploaded`) publicados via `EventEmitter2` interno do Nest: desacoplado dentro do
monólito, pronto para migrar para filas BullMQ/microserviço nas fases futuras sem redesenho.

### Frontend

Next.js 15 App Router. Server Components para leitura inicial (listagem/perfil de creator),
React Query para mutações e refetch client-side, Zustand restrito a estado de UI (sidebar
aberta/fechada, tema), React Hook Form + Zod reaproveitando os schemas de `packages/shared-types`.

## Banco de dados

Prisma + PostgreSQL. Ver schema completo abaixo — cobre apenas entidades usadas na Fase 1
(sem tabelas vazias antecipadas para módulos futuros).

```prisma
model User {
  id                  String   @id @default(cuid())
  email               String   @unique
  passwordHash        String?
  name                String
  avatarUrl           String?
  roleId              String
  role                Role     @relation(fields: [roleId], references: [id])
  permissionOverrides UserPermission[]
  twoFactorSecret     String?
  twoFactorEnabled    Boolean  @default(false)
  googleId            String?  @unique
  refreshTokens       RefreshToken[]
  status              UserStatus @default(ACTIVE)
  assignedCreators    Creator[] @relation("CSResponsible")
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

enum UserStatus {
  ACTIVE
  SUSPENDED
}

model Role {
  id          String   @id @default(cuid())
  name        String   @unique   // ADMIN, MANAGER, CS, FINANCE, MARKETING, AFFILIATE, VIEWER
  permissions RolePermission[]
  users       User[]
}

model Permission {
  id            String   @id @default(cuid())
  resource      String   // "creators", "deals", "financeiro", ...
  action        String   // "create", "read", "update", "delete", "export"
  roles         RolePermission[]
  userOverrides UserPermission[]

  @@unique([resource, action])
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])

  @@id([roleId, permissionId])
}

enum PermissionEffect {
  GRANT
  DENY
}

model UserPermission {
  userId       String
  permissionId String
  effect       PermissionEffect
  user         User       @relation(fields: [userId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])

  @@id([userId, permissionId])
}

model RefreshToken {
  id        String    @id @default(cuid())
  userId    String
  tokenHash String
  expiresAt DateTime
  revokedAt DateTime?
  user      User      @relation(fields: [userId], references: [id])
}

enum CreatorStatus {
  ACTIVE
  INACTIVE
  BLOCKED
}

model Creator {
  id       String        @id @default(cuid())
  photoUrl String?
  name     String
  nickname String?
  status   CreatorStatus @default(ACTIVE)
  category String?
  isVip    Boolean       @default(false)
  tags     String[]

  // contato
  phone    String?
  whatsapp String?
  email    String?
  country  String?
  language String?

  // redes sociais
  telegram String?
  discord  String?
  instagram String?
  tiktok   String?
  youtube  String?
  kick     String?
  facebook String?
  twitterX String?

  // responsáveis
  csResponsibleId String?
  csResponsible   User?   @relation("CSResponsible", fields: [csResponsibleId], references: [id])
  managerId       String?

  // financeiro/documentos (criptografados em repouso — ver Segurança)
  pixKey      String?
  bankName    String?
  bankAccount String?
  cpf         String?
  cnpj        String?

  notes          String?
  files          CreatorFile[]
  timelineEvents CreatorTimelineEvent[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum FileType {
  PHOTO
  CONTRACT
  DOCUMENT
  OTHER
}

model CreatorFile {
  id           String   @id @default(cuid())
  creatorId    String
  creator      Creator  @relation(fields: [creatorId], references: [id])
  type         FileType
  fileName     String
  storageKey   String   // chave no MinIO/S3
  mimeType     String
  sizeBytes    Int
  uploadedById String
  createdAt    DateTime @default(now())
}

model CreatorTimelineEvent {
  id          String   @id @default(cuid())
  creatorId   String
  creator     Creator  @relation(fields: [creatorId], references: [id])
  type        String   // STATUS_CHANGE, NOTE, FILE_UPLOAD, CREATED, ...
  description String
  actorId     String?
  metadata    Json?
  createdAt   DateTime @default(now())
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String
  resource   String
  resourceId String?
  metadata   Json?
  ipAddress  String?
  createdAt  DateTime @default(now())
}
```

## Auth & Segurança

- **Login:** email/senha (hash Argon2) ou Google OAuth (Passport, credenciais via `.env`).
- **JWT:** access token de 15 min + refresh token de 7 dias, rotacionado a cada uso, hash
  armazenado em `RefreshToken`, revogável individualmente.
- **2FA:** TOTP via `otplib` (compatível Google Authenticator/Authy), opcional por usuário,
  ativação gera QR code.
- **RBAC:** `PermissionsGuard` do Nest resolve permissões do `Role` do usuário e aplica
  overrides de `UserPermission` — **DENY sempre vence sobre GRANT**, tanto vindo do role
  quanto de override individual. Decorator `@RequirePermission('creators:update')` nos endpoints.
- **Rate limiting:** `@nestjs/throttler` em login, refresh e verificação 2FA.
- **Campos sensíveis** (`cpf`, `cnpj`, `pixKey`, `bankAccount`): criptografados em repouso
  (AES-256-GCM, chave via variável de ambiente nesta fase; KMS gerenciado é melhoria futura),
  decriptados apenas na leitura autorizada.
- **Auditoria:** interceptor global grava em `AuditLog` toda mutação (create/update/delete)
  com ator, IP e dados relevantes — cobre a exigência de trilha de auditoria/LGPD desde já.

## Armazenamento de arquivos

MinIO no Docker Compose, cliente `@aws-sdk/client-s3` na camada `infrastructure` do módulo
`creators`. Upload via presigned URL: o frontend sobe o arquivo direto no bucket, o backend
apenas gera a URL assinada e registra o metadata em `CreatorFile`. Troca para S3/R2 real em
produção é apenas configuração, sem mudança de código.

## Frontend — Dashboard shell

- Sidebar recolhível (estado persistido em cookie).
- Dark mode via `next-themes`, padrão dark.
- Ctrl+K abre paleta de comandos (`cmdk`): nesta fase, busca creators por nome/nickname/tag
  e comandos de navegação/criação rápida.
- Listagem de creators via TanStack Table: sort, filtro por status/categoria/CS/tag,
  paginação server-side.
- Animações via Framer Motion em transições de página/modal, uso comedido.

## Testes & CI

- **Backend:** Jest. Unit tests nos use-cases (domínio puro, sem mocks pesados); integration
  tests dos endpoints principais contra Postgres real via Testcontainers.
- **Frontend:** Vitest + Testing Library para componentes críticos (formulário de creator,
  tabela de listagem).
- **CI (GitHub Actions):** lint + typecheck + testes em cada PR, build do monorepo com cache
  do Turborepo. Deploy fica fora do CI nesta fase (sem infra provisionada ainda).

## Docker Compose (dev)

Serviços: `postgres`, `redis`, `minio`, `api` (NestJS com hot-reload), `web` (Next.js dev
server). `docker compose up` sobe o ambiente completo de desenvolvimento.

## Próximos passos (fora deste spec)

Após a Fase 1 estar funcional, cada um dos módulos a seguir recebe seu próprio spec e plano
de implementação, na ordem sugerida: (2) Deals + Financeiro, (3) Entregas + Calendário +
Campanhas + Redes Sociais, (4) Contratos + Exclusividade, (5) Relatórios + exportação,
(6) Agente de IA, (7) Notificações multi-canal.
