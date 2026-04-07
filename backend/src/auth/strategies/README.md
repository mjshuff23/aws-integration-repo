# Auth Strategies

## Purpose

This folder contains Passport strategy implementations used by the auth system.

## What Lives Here

- `jwt.strategy.ts`: Reads a JWT from the configured cookie, validates it, and maps the payload into an authenticated user object.

## How It Fits Into The System

This strategy is the runtime answer to “where does the authenticated user come from on an incoming request?”

## Concepts To Know

- Passport strategies define authentication mechanics.
- `ExtractJwt.fromExtractors(...)` allows custom token extraction logic.
- In this repo, the extractor reads from `request.cookies[cookieName]`, not from an `Authorization` header.

## Gotchas

- Cookie extraction and cookie writing must stay aligned on the same cookie name.
- `secretOrKey` must match the secret used when signing tokens.

## Related READMEs

- [`../guards/README.md`](../guards/README.md)
- [`../types/README.md`](../types/README.md)
- [`../README.md`](../README.md)
