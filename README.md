# aws-integration-repo

## Purpose

This repo is a small full-stack learning system that keeps the moving parts real:

- A Next.js 16 frontend renders the user interface.
- A NestJS 11 backend exposes an auth and user-account API.
- Prisma maps the backend to PostgreSQL.
- Docker Compose gives you a local full-stack run.
- Terraform provisions the AWS version of the same system.
- GitHub Actions handles CI and image-based deployment.

The documentation in this repo is intentionally layered. Root and app READMEs explain architecture and framework decisions. Folder-level READMEs explain why a local abstraction exists and how it participates in the larger system.

## What Lives Here

- [`frontend`](./frontend): Next.js App Router app, feature folders, API helpers, and shared UI-facing types.
- [`backend`](./backend): NestJS application, Prisma integration, auth flow, DTO validation, and e2e tests.
- [`infra`](./infra): Terraform stack and infrastructure-oriented documentation.
- [`scripts`](./scripts): Small operational helpers, currently focused on Terraform safety and ergonomics.
- [`.github`](./.github): CI and deploy automation.
- `docker-compose.yml`: Local full-stack orchestration for database, backend, and frontend containers.

## How It Fits Into The System

At a high level, the browser talks to the Next.js app and the Next.js app talks directly to the Nest API over HTTP. Authentication is cookie-based rather than token storage in browser code.

```text
Browser
  -> Next.js frontend
  -> fetch(..., { credentials: "include" })
  -> NestJS API under /api
  -> Prisma
  -> PostgreSQL
```

The AWS deployment keeps the same app split, but adds edge and container infrastructure:

```text
Browser
  -> CloudFront
  -> ALB
  -> /api* -> backend ECS service
  -> everything else -> frontend ECS service
  -> backend -> RDS + Secrets Manager
```

## Runtime/Data Flow

### Auth request flow

1. The frontend bootstraps by requesting `GET /api/auth/me`.
2. The backend reads the JWT from an HttpOnly cookie.
3. The JWT strategy resolves the user identity from the cookie value.
4. Guards protect authenticated routes such as `/api/users/me`.
5. Signup and login return the user payload and attach a fresh auth cookie.
6. Logout clears the cookie. Delete-account also clears it after the user row is removed.

### Frontend to backend coupling

- The frontend always talks to `NEXT_PUBLIC_API_URL`.
- The frontend helper normalizes the base URL so it always ends in `/api`.
- In local development that usually resolves to `http://localhost:4000/api`.
- In production it resolves to `/api`, which keeps browser traffic on the same public origin behind CloudFront.

### Backend to database coupling

- Nest bootstraps `ConfigModule` globally.
- `PrismaService` extends `PrismaClient` and connects when the Nest module starts.
- The backend reads `DATABASE_URL` from env or AWS Secrets Manager, depending on environment.
- Prisma migrations define schema changes and are applied before production startup or during deploy workflows.

## Important Files

- [`docker-compose.yml`](./docker-compose.yml): Local stack entrypoint.
- [`frontend/app/page.tsx`](./frontend/app/page.tsx): App Router entry page that mounts the home experience.
- [`frontend/features/session/hooks/use-user-session.ts`](./frontend/features/session/hooks/use-user-session.ts): Main frontend state machine for auth and profile updates.
- [`backend/src/configure-app.ts`](./backend/src/configure-app.ts): Global Nest configuration for CORS, validation, API prefix, and Swagger.
- [`backend/src/auth/auth.service.ts`](./backend/src/auth/auth.service.ts): Signup/login/session-cookie behavior.
- [`backend/src/users/users.service.ts`](./backend/src/users/users.service.ts): User persistence and sanitization logic.
- [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma): Prisma schema and database model source of truth.
- [`infra/terraform`](./infra/terraform): AWS infrastructure root module.
- [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml): Container build and ECS deployment workflow.

## Concepts To Know

### TypeScript in this repo

- TypeScript is mainly used here to describe boundaries: props, DTOs, env-driven behavior, JWT payload shapes, and returned API data.
- A `type` alias in this repo usually describes data shape without runtime behavior.
- A Nest `class` DTO is different: it exists so decorators can attach runtime validation metadata.

### Next.js App Router

- Files in `frontend/app` define routes and layouts.
- Components are server components by default in App Router.
- A file marked with `"use client"` opts into client-side hooks, browser APIs, and interactive state.
- This repo keeps the route file small and pushes real UI/state into `features`.

### NestJS modules

- Nest organizes code into modules that bundle controllers, providers, and imports.
- Controllers define HTTP routes.
- Services hold business logic.
- Guards and strategies sit in the request pipeline and decide whether a request is authenticated.

### Prisma

- Prisma is the typed data-access layer between Nest and PostgreSQL.
- `schema.prisma` defines models and database connection settings.
- Migrations are the history of schema changes that Prisma can apply to a live database.

### Terraform

- Terraform files are split by concern for readability, but they still form one root module and one state file.
- Variables describe configurable inputs.
- Outputs expose values other systems need, such as CloudFront and IAM role identifiers.
- Local state means Terraform tracks infrastructure in files on disk rather than a remote backend.

## Common Change Scenarios

### Add a new frontend feature

1. Add or extend a feature folder under [`frontend/features`](./frontend/features).
2. Keep page files thin and move reusable state or formatting logic into a local `hooks`, `types`, `utils`, or `lib` folder when it earns that abstraction.
3. Update or add READMEs around the new folders so the reasoning stays discoverable.

### Add a backend route

1. Decide which module owns the behavior.
2. Add or extend DTOs if request validation or response documentation changes.
3. Update Swagger-facing decorators where appropriate.
4. Add tests if the new route changes user-visible behavior.

### Add infrastructure

1. Decide whether the change belongs in the existing Terraform root module.
2. Place resources in the subsystem file that best matches the concern.
3. Update outputs, workflow assumptions, and READMEs if the deploy flow or runtime path changes.

## Local Development

### Environment setup

Create local env files from the examples:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Root `.env` drives Compose ports and database credentials:

```env
FRONTEND_PORT=3000
BACKEND_PORT=4000
POSTGRES_PORT=5432
POSTGRES_DB=app_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

Backend `.env` drives Nest runtime behavior:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@db:5432/app_db?schema=public
JWT_SECRET=replace-this-in-production
JWT_EXPIRES_IN=7d
COOKIE_NAME=auth_token
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Frontend `.env` tells the browser app where the API lives:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

If you run the backend outside Docker, adjust `DATABASE_URL` so the host points at a database your machine can actually reach.

### Docker Compose workflow

Start the full stack:

```bash
docker compose up --build
```

Run it in the background:

```bash
docker compose up --build -d
```

Stop containers:

```bash
docker compose down
```

Stop containers and delete the named Postgres volume:

```bash
docker compose down -v
```

Compose runs production-style containers locally:

- PostgreSQL 18.3 with a healthcheck.
- A backend container that runs Prisma migrations before starting Nest.
- A frontend container built against `http://localhost:4000/api`.

### Per-service workflow

Frontend:

```bash
cd frontend
pnpm install
pnpm dev
```

Backend:

```bash
cd backend
pnpm install
pnpm prisma:generate
pnpm start:dev
```

## Verification

These are the baseline checks for the current repo shape:

```bash
cd backend && pnpm lint
cd backend && pnpm build
cd frontend && pnpm lint
cd frontend && pnpm build
docker compose config
```

Backend e2e tests use a real PostgreSQL database:

```bash
docker compose up -d db
cd backend
pnpm prisma:migrate:deploy
pnpm test:e2e
```

Swagger is available at `http://localhost:4000/api/docs`.

## AWS Deployment

Terraform in [`infra/terraform`](./infra/terraform) provisions:

- A VPC with public subnets for ECS and private DB subnets for RDS.
- An ALB that routes `/api*` to the backend service and everything else to the frontend service.
- A CloudFront distribution in front of the ALB.
- Separate ECS Fargate services for frontend and backend.
- Separate ECR repositories for frontend and backend images.
- A single-AZ RDS PostgreSQL instance.
- Secrets Manager secrets for `DATABASE_URL` and `JWT_SECRET`.
- CloudWatch log groups for both services.
- A GitHub OIDC IAM role used by the deploy workflow.

Quick start:

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

The helper script in [`scripts`](./scripts) wraps those commands and snapshots local state before destructive actions.

Important outputs:

- `cloudfront_domain_name`
- `github_actions_deploy_role_arn`
- `frontend_ecr_repository_url`
- `backend_ecr_repository_url`

After `terraform apply`, set `AWS_DEPLOY_ROLE_ARN` in GitHub repository variables so [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) can assume the IAM role and publish fresh images.

## Gotchas

- There is no monorepo task runner here. Frontend and backend are separate `pnpm` projects.
- Frontend auth depends on `credentials: "include"`. Remove that and cookie-based auth stops working.
- Backend CORS depends on `FRONTEND_URL`. If that value is wrong, browser calls will fail even if the API itself is healthy.
- `backend/.env.example` uses the Docker hostname `db`. That is correct in Compose but usually wrong for a backend process running directly on your machine.
- Terraform uses local state in this repo. Treat `infra/terraform/state-backups/` as backups, not as a normal source of truth to restore after every change.

## Related READMEs

- [`frontend/README.md`](./frontend/README.md)
- [`backend/README.md`](./backend/README.md)
- [`infra/README.md`](./infra/README.md)
- [`infra/terraform/README.md`](./infra/terraform/README.md)
- [`scripts/README.md`](./scripts/README.md)
- [`.github/README.md`](./.github/README.md)

- Frontend: install, lint, build
- Backend: install, generate Prisma client, apply migrations, lint, build, e2e against PostgreSQL 18.3

### Deployment

`deploy.yml` runs on pushes to `main` and manual dispatch.

Before it can deploy, set these GitHub repository variables:

- `AWS_DEPLOY_ROLE_ARN`

Optional overrides if you change Terraform defaults:

- `AWS_REGION`
- `AWS_PROJECT_NAME`
- `AWS_ENVIRONMENT`

The deploy workflow:

1. Assumes the AWS role via GitHub OIDC
2. Builds and pushes both images to ECR
3. Registers new ECS task definition revisions
4. Runs `pnpm prisma:migrate:deploy` as a one-off Fargate task
5. Deploys the backend service and waits for stability
6. Deploys the frontend service and waits for stability

## First AWS Rollout Checklist

1. Apply Terraform in `infra/terraform`.
2. Copy the Terraform output `github_actions_deploy_role_arn` into the GitHub repository variable `AWS_DEPLOY_ROLE_ARN`.
3. Push to `main` or trigger the deploy workflow manually.
4. Open `https://<cloudfront_domain_name>`.
5. Verify:
   - frontend page load
   - signup
   - login
   - `/api/auth/me`
   - profile update
   - logout
   - delete account
   - `/api/docs`

## Notes

- This is intentionally a lean learning stack, not a hardened production platform.
- CloudFront handles viewer HTTPS, while the origin hop to the ALB is HTTP in phase 1 because there is no custom domain and no ACM certificate on the ALB.
- ECS services are created with `latest` image references by Terraform so the first `terraform apply` can finish before the first GitHub deployment pushes the real images.
