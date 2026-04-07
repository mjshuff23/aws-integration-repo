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
