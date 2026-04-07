# Backend Tests

## Purpose

This folder contains backend tests, currently focused on end-to-end API behavior.

## What Lives Here

- `app.e2e-spec.ts`: End-to-end flow covering health, signup, login, current user, update, logout, delete, and stale-session behavior.

## How It Fits Into The System

The current test strategy emphasizes realistic integration over isolated unit coverage:

- Nest app boots for real.
- Prisma talks to a real PostgreSQL database.
- Cookies, validation, and guards all participate.

## Concepts To Know

- E2E tests validate behavior across multiple layers at once.
- `request.agent(...)` from Supertest keeps cookies between requests, which is why it is a good fit for session-based auth testing.

## Common Change Scenarios

- Add to this spec when changing user-visible auth or account behavior.
- Keep the test data setup and cleanup aligned with Prisma schema changes.

## Gotchas

- The e2e test assumes a reachable PostgreSQL instance and sets fallback env values in the test itself.
- The test deletes all users before and after running, so do not point it at a database you care about preserving.

## Related READMEs

- [`../README.md`](../README.md)
- [`../prisma/migrations/README.md`](../prisma/migrations/README.md)
