# Auth Guards

## Purpose

This folder contains route-authorization guards for auth-protected behavior.

## What Lives Here

- `jwt-auth.guard.ts`: Thin wrapper around Passport's `AuthGuard('jwt')`.

## How It Fits Into The System

The guard is what you apply to a route or controller when you want Nest to run the JWT strategy before the handler executes.

## Concepts To Know

- A guard does not usually parse the JWT itself. It decides whether a request may proceed.
- `AuthGuard('jwt')` delegates the actual authentication work to the strategy registered under the `jwt` name.

## Related READMEs

- [`../strategies/README.md`](../strategies/README.md)
- [`../decorators/README.md`](../decorators/README.md)
- [`../README.md`](../README.md)
