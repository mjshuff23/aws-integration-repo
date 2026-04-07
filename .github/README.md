# GitHub Automation

## Purpose

This folder describes how the repo behaves inside GitHub rather than on your machine. It is where CI and deployment rules live.

## What Lives Here

- [`workflows`](./workflows): GitHub Actions workflow definitions for CI and AWS deployment.

## How It Fits Into The System

GitHub Actions is the automation bridge between source control and runtime environments:

- CI validates that frontend and backend still lint, build, and pass backend e2e coverage for the current stack.
- Deployment builds Docker images, pushes them to ECR, and rolls ECS services forward.

## Common Change Scenarios

- Edit [`workflows`](./workflows) when CI or deployment behavior changes.
- Cross-check [`../infra/terraform`](../infra/terraform) if a workflow depends on new IAM permissions or resource names.
- Cross-check app READMEs if workflow steps start depending on new commands or env values.

## Related READMEs

- [`workflows/README.md`](./workflows/README.md)
- [`../infra/terraform/README.md`](../infra/terraform/README.md)
- [`../README.md`](../README.md)
