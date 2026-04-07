# Health Endpoint

## Purpose

This folder contains the lightweight health-check endpoint used by infrastructure and tests.

## What Lives Here

- `health.controller.ts`: `GET /api/health` returning `{ status: "ok" }`.

## How It Fits Into The System

This endpoint exists mainly for load balancer and operational health checks. It gives infrastructure something cheap and stable to probe without invoking auth or database-heavy behavior.

## Gotchas

- The Terraform backend target group health check expects this route to stay at `/api/health`.

## Related READMEs

- [`../README.md`](../README.md)
- [`../../../infra/terraform/README.md`](../../../infra/terraform/README.md)
