# Auth Types

## Purpose

This folder contains TypeScript data shapes used by the auth system.

## What Lives Here

- `jwt-payload.type.ts`: Shape of the signed JWT payload.
- `jwt-user.type.ts`: Shape of the authenticated user object exposed to the rest of the app.

## How It Fits Into The System

These types sit at the boundary between JWT storage format and application-friendly user identity data.

## Concepts To Know

- `sub` in a JWT payload conventionally means “subject,” which in this repo is the user ID.
- These are compile-time shapes only. The actual runtime data still comes from JWT signing and verification.

## Related READMEs

- [`../strategies/README.md`](../strategies/README.md)
- [`../decorators/README.md`](../decorators/README.md)
- [`../README.md`](../README.md)
