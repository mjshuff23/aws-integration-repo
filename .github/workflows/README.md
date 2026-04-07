# GitHub Workflows

## Purpose

These workflow files define the repository's automated checks and the production deployment path.

## What Lives Here

- [`ci.yml`](./ci.yml): Frontend and backend validation on pull requests and pushes to `main`.
- [`deploy.yml`](./deploy.yml): Image build, ECR push, Prisma migration task, and ECS rollout on pushes to `main` or manual dispatch.

## How It Fits Into The System

The workflows encode operational assumptions that matter to the whole repo:

- Which Node and pnpm versions automation uses.
- Which commands count as the baseline health check.
- How AWS credentials are obtained.
- How new backend schema changes reach production safely.

## Runtime/Data Flow

### `ci.yml`

- Triggers on pull requests and pushes to `main`.
- Runs frontend and backend jobs separately.
- Frontend installs dependencies, lints, and builds with `NEXT_PUBLIC_API_URL=/api`.
- Backend starts PostgreSQL as a GitHub Actions service, installs dependencies, generates Prisma client code, applies migrations, lints, builds, and runs e2e tests.

### `deploy.yml`

- Triggers on manual dispatch and pushes to `main`.
- Assumes an AWS IAM role through GitHub OIDC.
- Builds backend and frontend images and pushes both SHA-tagged and `latest` tags to ECR.
- Reads the current ECS task definitions, swaps image URIs, and registers new revisions.
- Runs `pnpm prisma:migrate:deploy` as a one-off Fargate task before updating the backend service.
- Updates backend and frontend ECS services and waits for stability.

## Concepts To Know

### OIDC deploy roles

GitHub Actions can assume AWS roles without storing permanent AWS access keys in GitHub. Terraform sets up the trust relationship, and the workflow uses `aws-actions/configure-aws-credentials` to exchange GitHub identity for temporary AWS credentials.

### Task definition revisioning

ECS services do not deploy “an image” directly. They deploy a specific task definition revision. The workflow fetches the current definition, changes the image field, registers a new revision, and tells the service to use it.

### One-off migration tasks

Running migrations as part of backend container startup is fine locally, but in production the workflow uses a one-off Fargate task first. That separates schema migration from long-running service replacement and makes deploy failures easier to reason about.

## Common Change Scenarios

- If app startup commands change, update the workflow and the relevant app README together.
- If AWS resource names or permissions change, update Terraform first or at the same time.
- If CI starts failing unexpectedly after dependency changes, check pinned action versions and runtime versions before blaming app code.

## Gotchas

- `deploy.yml` requires the `AWS_DEPLOY_ROLE_ARN` repository variable and the GitHub `production` environment by default.
- The deploy workflow assumes ECR repositories and ECS services already exist. Terraform must run first.
- The backend workflow depends on a real PostgreSQL service, so schema or migration issues often surface there before runtime.

## Related READMEs

- [`../README.md`](../README.md)
- [`../../infra/terraform/README.md`](../../infra/terraform/README.md)
- [`../../backend/README.md`](../../backend/README.md)
- [`../../frontend/README.md`](../../frontend/README.md)
