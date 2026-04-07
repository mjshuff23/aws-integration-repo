# Architecture Feature

## Purpose

This feature owns the `/architecture` page and its repo-specific explanation of
the Terraform-managed AWS stack.

## What Lives Here

- `components`: Static page composition for the infrastructure view.

## How It Fits Into The System

This feature bridges generated infrastructure assets and human-readable system
context:

- The diagram itself is generated from Terraform state into `public/`.
- The feature explains how that diagram maps to request flow and deployment.

## Related READMEs

- [`components/README.md`](./components/README.md)
- [`../../infra/terraform/README.md`](../../infra/terraform/README.md)
