# Terraform AWS Stack

## Purpose

This directory defines the AWS version of the learning stack. It keeps the infrastructure small enough to understand end to end while still modeling a realistic deployment path:

- CloudFront is the public entrypoint.
- An ALB routes traffic by path.
- Separate ECS services run the frontend and backend containers.
- RDS stores application data.
- Secrets Manager stores runtime secrets.
- GitHub Actions deploys through AWS OIDC instead of long-lived IAM keys.

Terraform is doing two jobs here:

1. Declaring the infrastructure itself.
2. Encoding the assumptions that connect infrastructure to the application runtime.

## What Lives Here

- `versions.tf`: Terraform and provider requirements.
- `variables.tf`: Input contract for the root module.
- `locals.tf`: Shared derived values such as naming and image URIs.
- `network.tf`: VPC, public subnets, private DB subnets, route table, and DB subnet group.
- `security.tf`: Security groups and the CloudFront managed prefix list.
- `registry.tf`: ECR repositories for frontend and backend images.
- `secrets.tf`: Generated database/JWT secrets and Secrets Manager storage.
- `database.tf`: RDS PostgreSQL instance.
- `logging.tf`: CloudWatch log groups.
- `iam.tf`: ECS execution role and GitHub OIDC deploy role.
- `routing.tf`: ALB, target groups, listener rules, and CloudFront.
- `ecs-task-definitions.tf`: Runtime container definitions and env/secrets injection.
- `ecs-services.tf`: ECS cluster and long-running services.
- `outputs.tf`: Values needed by humans or automation after apply.

## How It Fits Into The System

Terraform is the bridge between application code and AWS runtime. The important thing to understand is not just which resources exist, but why they are arranged this way.

```text
CloudFront
  -> ALB
  -> /api* target group -> backend ECS task
  -> default target group -> frontend ECS task
  -> backend ECS task -> Secrets Manager + RDS
```

The frontend and backend are built separately but deployed into one public application surface:

- The frontend is publicly reachable through CloudFront and the ALB.
- The backend is also publicly reachable, but only through the `/api` path rule.
- The database is not public. Only the backend service security group may reach it.

## Runtime/Data Flow

### Request path

1. A browser request hits the CloudFront distribution.
2. CloudFront forwards the request to the ALB.
3. The ALB checks the request path.
4. `/api` and `/api/*` go to the backend target group.
5. Everything else goes to the frontend target group.
6. The backend task reads `DATABASE_URL` and `JWT_SECRET` from Secrets Manager at runtime through ECS task definition secret wiring.
7. The backend opens database connections to the RDS instance inside the VPC.

### Deployment path

1. GitHub Actions builds frontend and backend Docker images.
2. The workflow pushes those images to ECR.
3. The workflow reads the current ECS task definitions.
4. It registers new task definition revisions with updated image URIs.
5. It runs Prisma migrations as a one-off Fargate task using the backend task definition.
6. It updates the ECS services to the new task definition revisions.

### Secret path

- `secrets.tf` creates the secret containers and their current versions.
- `locals.tf` constructs the final `DATABASE_URL`.
- `ecs-task-definitions.tf` injects the secret ARNs into the backend container definition.
- `iam.tf` grants the ECS task execution role permission to read those secrets.

## Important Files

- [`variables.tf`](./variables.tf): Start here if you want to learn what can be changed safely.
- [`locals.tf`](./locals.tf): Shows how raw inputs become deployment-ready naming and URLs.
- [`routing.tf`](./routing.tf): Best file for understanding public request flow.
- [`ecs-task-definitions.tf`](./ecs-task-definitions.tf): Best file for understanding runtime env and secret injection.
- [`iam.tf`](./iam.tf): Explains why GitHub Actions can deploy without static AWS credentials.
- [`outputs.tf`](./outputs.tf): The values you need after `terraform apply`.

## File-To-Resource Mapping

Terraform still treats this directory as one root module. The file split is only for readability.

- Put a resource in the file whose concern it belongs to.
- Keep cross-resource references explicit instead of hiding them behind unnecessary locals.
- Avoid creating a new file unless the existing subsystem split stops being readable.

A useful mental model is:

- `variables.tf` and `outputs.tf` are the public contract.
- `locals.tf` is shared assembly logic.
- The remaining files describe actual infrastructure subsystems.

## Variables and Outputs

### Variables

The most important inputs are:

- `github_repository`: Which GitHub repository may assume the deploy role.
- `aws_region`: Region, defaulting to `us-east-1`.
- `project_name` and `environment`: Naming inputs used across resources.
- `frontend_*` and `backend_*`: ECS task sizing and desired counts.
- `db_*`: Database identity and capacity decisions.
- `jwt_expires_in` and `cookie_name`: Runtime values passed into the backend task.

When deciding whether something should be a variable, ask:

- Does an operator reasonably need to change this between environments?
- Would changing it be meaningful without editing application code?

### Outputs

The most operationally important outputs are:

- `cloudfront_domain_name`: Public URL for the deployed system.
- `github_actions_deploy_role_arn`: IAM role used by GitHub Actions.
- `frontend_ecr_repository_url` and `backend_ecr_repository_url`: Image destinations.
- `ecs_cluster_name`, `frontend_service_name`, `backend_service_name`: Useful for debugging or CLI operations.

## Quick Start

Create the variable file:

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
```

Set at least:

```hcl
github_repository = "OWNER/REPO"
```

Then run:

```bash
terraform init
terraform plan
terraform apply
```

Or use the safer wrapper from [`../../scripts/README.md`](../../scripts/README.md):

```bash
./scripts/infra.sh plan
./scripts/infra.sh up
```

To regenerate the frontend architecture view from the current Terraform stack:

```bash
./scripts/infra.sh diagram
```

That command publishes a generated SVG plus the icon assets it references under
`frontend/public/architecture/`, which makes the result browsable at the
frontend `/architecture` route.

## Key Assumptions

- Region defaults to `us-east-1`.
- Project name defaults to `auth-stack`.
- Environment defaults to `prod`.
- State is local in this repo.
- ECS tasks run in public subnets with public IPs, which avoids introducing NAT gateways into the learning stack.
- RDS runs in private DB subnets and is reachable only from the backend ECS service security group.
- CloudFront uses the default certificate and default `*.cloudfront.net` hostname.
- The frontend container uses `NEXT_PUBLIC_API_URL=/api` in production so browser traffic stays on one public origin.

## Common Change Scenarios

### Add another AWS resource

1. Decide whether it belongs in this root module or deserves a future module split.
2. Place it in the existing subsystem file if possible.
3. Update variables or outputs only if the change creates a new external contract.
4. Update README guidance if the runtime or deploy flow changes.

### Change request routing

1. Start in `routing.tf`.
2. Confirm health-check paths still match app behavior.
3. Confirm frontend and backend task definitions still expose the ports and env values the routing layer assumes.
4. Regenerate the architecture page asset so the published diagram stays current.

### Change deploy automation assumptions

1. Check `iam.tf` for permissions.
2. Check `outputs.tf` for values GitHub Actions consumes indirectly.
3. Check [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) for the workflow behavior Terraform is enabling.

## Cleanup

Destroy the stack when you are done:

```bash
terraform destroy
```

Or use:

```bash
./scripts/infra.sh down
```

Destroying infrastructure is a normal Terraform operation. It does not “break” Terraform. It updates state so Terraform knows those managed resources no longer exist.

## Gotchas

- Local state is easy to understand but easy to misuse. A stale or copied state file can confuse ownership if you are not disciplined.
- `state-backups/` is for backup and recovery, not for routinely restoring old state after a successful destroy.
- ECS task definitions hard-code several runtime environment values. If the application contract changes, infrastructure and code need to move together.
- The GitHub OIDC trust policy is scoped to `repo:${var.github_repository}:environment:${var.github_environment_name}`. If your GitHub environment name changes, deployment will fail until Terraform is updated and applied.
- Health check paths must keep matching real app routes. The backend target group expects `/api/health` to return success.

## Related READMEs

- [`../README.md`](../README.md)
- [`../../README.md`](../../README.md)
- [`../../scripts/README.md`](../../scripts/README.md)
- [`../../.github/workflows/README.md`](../../.github/workflows/README.md)
