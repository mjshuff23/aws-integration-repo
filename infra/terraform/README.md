# Terraform AWS Stack

This directory provisions the lean AWS learning environment for the repo:

- CloudFront
- Application Load Balancer
- ECS Fargate frontend and backend services
- ECR repositories
- RDS PostgreSQL 18
- Secrets Manager
- CloudWatch Logs
- GitHub Actions OIDC deploy role

## Quick Start

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
github_repository = "OWNER/REPO"
```

Then run:

```bash
terraform init
terraform plan
terraform apply
```

Or use the repo wrapper:

```bash
./scripts/infra.sh up
```

## Key Assumptions

- Region defaults to `us-east-1`
- Project name defaults to `auth-stack`
- Environment defaults to `prod`
- Terraform state is local for phase 1
- ECS tasks run in public subnets with public IPs so the stack does not need NAT gateways
- RDS runs in private DB subnets and is only reachable from the backend ECS service security group

## GitHub Actions Hand-Off

After `terraform apply`, capture:

- `github_actions_deploy_role_arn`
- `cloudfront_domain_name`

Set `AWS_DEPLOY_ROLE_ARN` in GitHub repository variables to the role ARN output, then use `.github/workflows/deploy.yml` to publish images and roll ECS forward.

## Cleanup

Destroy the stack when you are done learning:

```bash
terraform destroy
```

Or with the wrapper:

```bash
./scripts/infra.sh down
```

## Spinning The Stack Up And Down

`terraform destroy` does not break Terraform's ability to recreate the stack.
It updates the active state so Terraform knows the managed resources are gone.

To make this safer in local-state mode, the repo includes [`scripts/infra.sh`](../../scripts/infra.sh):

- `./scripts/infra.sh up`
- `./scripts/infra.sh down`
- `./scripts/infra.sh plan`
- `./scripts/infra.sh status`
- `./scripts/infra.sh outputs`

Before `plan`, `up`, and `down`, the script saves a timestamped backup of the
current state in `infra/terraform/state-backups/`.

Important:

- A state backup is for inspection or recovery, not for normal restore after a successful destroy.
- After a successful destroy, the current state being empty is correct and expected.
- Running `./scripts/infra.sh up` after `down` will recreate the infrastructure from config and `terraform.tfvars`.
