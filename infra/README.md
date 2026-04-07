# Infrastructure

## Purpose

This folder groups the infrastructure side of the repo. Its job is to explain how application code becomes a running AWS system, without mixing those details into the frontend or backend source trees.

## What Lives Here

- [`terraform`](./terraform): The AWS root module for networking, compute, database, secrets, logging, and deploy IAM.

## How It Fits Into The System

The application code defines behavior. The infrastructure code defines where that behavior runs, how traffic reaches it, and which supporting AWS services it may talk to.

If you are changing deployment, networking, runtime environment wiring, or AWS resource sizing, this is the documentation branch you should follow.

## Common Change Scenarios

- Start in [`terraform`](./terraform) when you need to change AWS resources.
- Cross-check [`../scripts`](../scripts) if the change affects local Terraform workflow.
- Cross-check [`../.github/workflows`](../.github/workflows) if the change affects deployment automation.

## Related READMEs

- [`terraform/README.md`](./terraform/README.md)
- [`../scripts/README.md`](../scripts/README.md)
- [`../.github/README.md`](../.github/README.md)
- [`../README.md`](../README.md)
