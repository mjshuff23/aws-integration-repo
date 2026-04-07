# Scripts

## Purpose

This folder holds small operational helpers. Right now it contains one script, but that script is important because it wraps Terraform in a safer local-state workflow.

## What Lives Here

- [`infra.sh`](./infra.sh): Wrapper around common Terraform commands for the repo's AWS stack.

## How It Fits Into The System

Terraform can be run directly, but this script adds guardrails that matter in a learning repo using local state:

- It checks for Terraform in `PATH`.
- It ensures the expected `terraform.tfvars` file exists before plan/apply/destroy.
- It initializes Terraform automatically if `.terraform` is missing.
- It snapshots current state and outputs before risky commands.

## Runtime/Data Flow

The script resolves a few important paths first:

- `ROOT_DIR`: repo root
- `TF_DIR`: `infra/terraform`
- `TFVARS_FILE`: default variable file, overridable via env
- `BACKUP_DIR`: `infra/terraform/state-backups`

Then each command delegates into Terraform:

- `init`: `terraform init`
- `plan`: snapshot state, then `terraform plan -var-file=...`
- `up`: snapshot state, `terraform apply`, snapshot again
- `down`: snapshot state, `terraform destroy`, snapshot again
- `diagram`: pull current state when available, generate an AWS topology SVG with Dockerized Inframap, and publish the required icon assets for the frontend
- `outputs`: show outputs
- `status`: show tracked resources plus outputs
- `backup-state`: create a manual snapshot

## Important Files

- [`infra.sh`](./infra.sh)
- [`../infra/terraform/README.md`](../infra/terraform/README.md)

## Concepts To Know

### Local Terraform state

Terraform tracks what it believes it manages. In this repo that state is local on disk rather than stored in S3 or Terraform Cloud.

That makes the workflow easier to understand, but it also means:

- The state file is operationally important.
- Backups are useful.
- A successful destroy should leave the active state empty, and that is correct.

### Wrapper scripts

A wrapper script is not a second infrastructure system. It is just a repeatable interface over the real one. Here, the real system is still Terraform.

## Common Change Scenarios

- Add a new helper only if it solves a repo-wide operational problem.
- Keep script output plain and readable because these scripts are part teaching tool, part safety tool.
- If you change Terraform directory structure or expected variable files, update this script and its README together.
- If you change the published architecture route or asset location, update the `diagram` defaults together with the frontend route that serves them.

## Gotchas

- `backup-state` does not restore anything automatically. It only saves a copy.
- `TFVARS_FILE` is overridable. That is useful for experimentation, but it also means you should know which variable file a command is actually using.

## Related READMEs

- [`../infra/README.md`](../infra/README.md)
- [`../infra/terraform/README.md`](../infra/terraform/README.md)
- [`../README.md`](../README.md)
