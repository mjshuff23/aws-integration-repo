# Frontend Env Helpers

## Purpose

This folder contains frontend runtime-environment resolution logic.

## What Lives Here

- `api-base-url.ts`: Resolves and normalizes the API base URL.

## How It Fits Into The System

This helper is the boundary between deployment configuration and browser request behavior.

## Concepts To Know

- `process.env.NEXT_PUBLIC_*` values are injected into frontend code by Next.js at build/runtime boundaries.
- Normalization logic is useful when env values may be supplied with small inconsistencies, such as a missing `/api` suffix or trailing slash.

## Gotchas

- Production fallback is `/api`, not a full absolute URL.
- Development fallback is `http://localhost:4000/api`.

## Related READMEs

- [`../api/README.md`](../api/README.md)
- [`../../README.md`](../../README.md)
