# CS Hub — Fase 1: Conclusão (wiring do backend + frontend)

Data: 2026-08-07
Status: Aprovado

## Contexto

O spec [2026-08-06-cs-hub-fundacao-afiliados-design.md](2026-08-06-cs-hub-fundacao-afiliados-design.md)
definiu a Fase 1 (fundação + módulo Afiliados/Creators) e já foi parcialmente implementado:
o módulo `auth` está completo (use-cases, controller, guards, estratégias JWT/Google) e o
módulo `creators` tem toda a camada `domain`/`application`/`infrastructure` pronta (use-cases,
repositório Prisma, storage MinIO, criptografia de campos sensíveis, mapper de resposta).

Faltam duas coisas para a Fase 1 ficar funcional: (1) o **wiring** do backend — não existe
`creators.controller.ts`, `creators.module.ts`, `app.module.ts` nem `main.ts`, então a API
não sobe; e (2) o **frontend** inteiro — `apps/web` está vazio. Este documento cobre só essa
conclusão; nenhuma decisão de arquitetura do spec original é revisitada.

## Decisões de escopo

- Fechar o backend primeiro (controller + module + bootstrap + `docker-compose.yml`) antes de
  iniciar o frontend, para que ele seja construído e testado contra uma API real, não mockada.
- Token de acesso mantido em memória no frontend (nunca em `localStorage`), com refresh
  silencioso via cookie httpOnly no carregamento da página — mantém a separação que o backend
  já implementa (refresh token nunca chega ao JavaScript do cliente).
- Dashboard desta fase é só o *shell* (sidebar, topbar, busca Ctrl+K, dark mode) — os widgets de
  métricas (FTDs, GGR, ROI etc.) pertencem às fases futuras de Financeiro/Smartico/Tráfego.
- Perfil do Creator: abas de Financeiro, Smartico, Campanhas e Entregas ficam como placeholder
  "em breve", conforme já decidido no spec original.

## Backend — wiring

### `creators.controller.ts` + `creators.module.ts`

Segue exatamente o padrão de `auth.controller.ts`/`auth.module.ts`: use-cases injetados no
construtor, `ZodValidationPipe` com os schemas de `@cs-hub/shared-types`, guard de permissão via
`@RequirePermission("creators", action)`.

| Rota | Use-case | Permissão |
|---|---|---|
| `GET /creators` | `ListCreatorsUseCase` | `creators:read` |
| `POST /creators` | `CreateCreatorUseCase` | `creators:create` |
| `GET /creators/:id` | `GetCreatorUseCase` | `creators:read` |
| `PATCH /creators/:id` | `UpdateCreatorUseCase` | `creators:update` |
| `GET /creators/:id/timeline` | `ListTimelineUseCase` | `creators:read` |
| `POST /creators/:id/timeline` | `AddTimelineNoteUseCase` | `creators:update` |
| `GET /creators/:id/files` | `ListFilesUseCase` | `creators:read` |
| `POST /creators/:id/files/upload-request` | `RequestFileUploadUseCase` | `creators:update` |
| `POST /creators/:id/files/confirm` | `ConfirmFileUploadUseCase` | `creators:update` |

Respostas passam pelos mappers já existentes em `presentation/creator.mapper.ts`
(`toCreatorResponse`, `toCreatorSummaryResponse`, `toTimelineResponse`, `toFileResponse`).

### `app.module.ts`

Registra: `ConfigModule.forRoot({ validate: validateEnv, isGlobal: true })`, `PrismaModule`,
`EventEmitterModule.forRoot()`, `ThrottlerModule` (login/refresh/2FA já usam rate limit),
`AuthModule`, `CreatorsModule`, e os providers globais `APP_GUARD` (`JwtAuthGuard`,
`PermissionsGuard`) + `APP_INTERCEPTOR` (`AuditInterceptor`).

### `main.ts`

`helmet()`, `cookie-parser` (dependência nova — `auth.controller.ts` já lê `req.cookies` mas o
pacote não está instalado), CORS restrito a `CORS_ORIGIN`, `ValidationPipe`/filtro global de
exceção, escuta em `API_PORT`.

### `common/filters/http-exception.filter.ts`

Filtro global novo (a pasta já existe, vazia) para padronizar toda resposta de erro no formato
`{ statusCode, message, issues? }` — o `ZodValidationPipe` já popula `issues` nas validações.

### `docker-compose.yml`

Serviços `postgres`, `redis`, `minio` (+ um job one-shot para criar o bucket definido em
`MINIO_BUCKET`), `api` (hot-reload) e `web` (Next.js dev server), lendo as variáveis do
`.env.example`.

## Frontend — `apps/web`

### Estrutura de rotas (App Router)

- `/login` — email+senha, etapa de 2FA inline quando desafiado, botão "Continuar com Google".
- `/auth/google/callback` — lê o token do fragmento da URL, guarda em memória, redireciona para `/`.
- Layout `(dashboard)` — sidebar recolhível (estado em cookie), topbar, paleta de comandos Ctrl+K
  (`cmdk`), dark mode por padrão (`next-themes`).
- `/creators` — listagem via TanStack Table, sort/filtro/paginação server-side contra `GET /creators`.
- `/creators/new` e `/creators/[id]` — formulário completo (React Hook Form + `creatorInputSchema`
  de `@cs-hub/shared-types`) e perfil em abas: Info · Timeline · Arquivos · Financeiro (em breve)
  · Smartico (em breve) · Campanhas (em breve) · Entregas (em breve).

### Autenticação

`middleware.ts` verifica a presença do cookie de refresh (httpOnly) para bloquear rotas
protegidas no servidor e evitar flash de conteúdo não autenticado. Um `AuthProvider` client-side
tenta refresh silencioso (`POST /auth/refresh`) na montagem inicial para repopular o token de
acesso em memória; falha nesse refresh redireciona para `/login`.

### Camada de dados

React Query para todo estado de servidor/mutações; Zustand só para estado de UI (sidebar
aberta/fechada, tema) — nunca para dados vindos da API. Upload de arquivo segue o fluxo já
desenhado no backend: pede URL assinada → `PUT` direto no MinIO → confirma metadata.

## Testes & CI

- **Backend:** testes unitários dos use-cases (lógica de domínio pura, já escritos no código
  existente, faltam os arquivos `.spec.ts`); suíte e2e cobrindo os endpoints de creators via
  Testcontainers contra Postgres real.
- **Frontend:** Vitest + Testing Library para o formulário de creator e a tabela de listagem.
- **CI:** workflow novo em `.github/workflows` — lint + typecheck + test + build em cada PR,
  com cache do Turborepo (nenhum workflow existe hoje).

## Definição de "pronto" para a Fase 1

`docker compose up` sobe a stack completa; o admin seedado consegue logar (senha, 2FA opcional,
Google se configurado); creators podem ser listados/buscados/filtrados/paginados, criados,
editados com transições de status válidas, recebem notas na timeline e têm arquivos
enviados/baixados; RBAC (7 roles + overrides por usuário) é respeitado ponta a ponta; CI fica
verde num PR.
