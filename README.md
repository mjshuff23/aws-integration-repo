# aws-integration-repo

This repo now supports two workflows:

- Local development and smoke testing with Docker Compose or per-service `pnpm` commands
- AWS deployment in `us-east-1` with Terraform, ECS Fargate, RDS PostgreSQL, CloudFront, and GitHub Actions

## Stack

- Frontend: Next.js 16, React 19, Tailwind CSS
- Backend: NestJS 11, Swagger, Prisma, JWT-in-cookie auth
- Database: PostgreSQL 18
- Local orchestration: Docker Compose
- AWS target: CloudFront, ALB, ECS Fargate, RDS PostgreSQL, ECR, Secrets Manager, CloudWatch Logs
- CI/CD: GitHub Actions with AWS OIDC

## Repo Layout

```text
.
├── .github/workflows
├── backend
│   ├── prisma
│   ├── src
│   └── test
├── frontend
│   └── app
├── infra
│   └── terraform
└── docker-compose.yml
```

## API Surface

All API routes are now under `/api`.

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `DELETE /api/users/me`
- Swagger UI at `http://localhost:4000/api/docs`

## Environment Setup

Create local env files from the examples:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Root `.env` variables:

```env
FRONTEND_PORT=3000
BACKEND_PORT=4000
POSTGRES_PORT=5432
POSTGRES_DB=app_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

Backend `.env` variables:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@db:5432/app_db?schema=public
JWT_SECRET=replace-this-in-production
JWT_EXPIRES_IN=7d
COOKIE_NAME=auth_token
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Frontend `.env` variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

For AWS production, the backend uses:

- `DATABASE_URL` from Secrets Manager
- `JWT_SECRET` from Secrets Manager
- `FRONTEND_URL=https://<cloudfront-domain>`
- `NODE_ENV=production`

The frontend production image is built with `NEXT_PUBLIC_API_URL=/api`.

## Local Docker Compose

Start the full stack:

```bash
docker compose up --build
```

Run in the background:

```bash
docker compose up --build -d
```

Stop and remove containers:

```bash
docker compose down
```

Stop and remove containers plus volumes:

```bash
docker compose down -v
```

The Compose stack now runs production-style containers locally:

- PostgreSQL 18.3 with a healthcheck
- Backend image that applies Prisma migrations and starts Nest in production mode
- Frontend image built against `http://localhost:4000/api`

## Local Per-Service Development

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

If you run the backend outside Docker, set `backend/.env` to a database host your machine can reach.

## Local Verification

These commands should remain the baseline checks:

```bash
cd backend && pnpm lint
cd backend && pnpm build
cd frontend && pnpm lint
cd frontend && pnpm build
docker compose config
```

Backend e2e tests now hit a real PostgreSQL database. For a local run:

```bash
docker compose up -d db
cd backend
pnpm prisma:migrate:deploy
pnpm test:e2e
```

## AWS Infrastructure

Terraform lives in [`infra/terraform`](./infra/terraform) and provisions:

- 1 VPC with 2 public subnets and 2 private DB subnets
- 1 public ALB with `/api` routed to the backend and all other paths routed to the frontend
- 1 CloudFront distribution in front of the ALB using the default `*.cloudfront.net` domain
- 1 ECS cluster with 2 Fargate services
- 2 ECR repositories
- 1 single-AZ RDS PostgreSQL 18 instance
- Secrets Manager secrets for `DATABASE_URL` and `JWT_SECRET`
- CloudWatch log groups for both services
- 1 GitHub OIDC IAM role for deployments

Initialize Terraform:

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
```

Set `github_repository` in `terraform.tfvars` to your actual `OWNER/REPO`, then run:

```bash
terraform init
terraform plan
terraform apply
```

Important outputs:

- `cloudfront_domain_name`
- `github_actions_deploy_role_arn`
- `frontend_ecr_repository_url`
- `backend_ecr_repository_url`

Destroy the learning stack when you are done:

```bash
terraform destroy
```

## GitHub Actions

Two workflows are included:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

### CI

`ci.yml` runs on pull requests and pushes to `main`.

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
