# Session Hooks

## Purpose

This folder contains stateful session behavior for the frontend.

## What Lives Here

- `use-user-session.ts`: The main hook for bootstrapping the current user, managing auth/profile forms, and sending auth/account requests.

## How It Fits Into The System

Every major interactive branch of the current frontend depends on this hook. It is effectively the page-level controller for the app.

## Important Files

- [`use-user-session.ts`](./use-user-session.ts)

## Concepts To Know

- A custom hook is a reusable function that composes React hooks and returns a behavior contract.
- `startTransition` marks some updates as non-urgent UI work.
- Returning many handlers from one hook is acceptable when the hook represents one cohesive workflow, which is true here.

## Common Change Scenarios

- Extend this hook when auth/session behavior changes.
- Keep request details delegated to `lib/api/api-request.ts` unless the fetch contract itself changes.
- Update returned state and handlers carefully because `UserAccessPanel` depends on the contract shape.

## Gotchas

- The initial bootstrap request intentionally treats 401 as “not logged in,” not as a fatal app error.
- `window.confirm` makes this hook browser-only, which is one reason the consuming tree must stay client-rendered.

## Related READMEs

- [`../README.md`](../README.md)
- [`../types/README.md`](../types/README.md)
- [`../utils/README.md`](../utils/README.md)
- [`../../../lib/api/README.md`](../../../lib/api/README.md)
