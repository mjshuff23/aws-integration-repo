# Frontend Features

## Purpose

This folder groups frontend code by product domain. It is the main answer to “where should new UI behavior live?”

## What Lives Here

- `home`: Page composition and the marketing-plus-access layout.
- `auth`: Signup and login UI.
- `account`: Authenticated account management UI.
- `session`: Session state, form state, and user-facing auth/profile workflow logic.

## How It Fits Into The System

Feature folders sit between App Router entrypoints and lower-level helpers:

```text
app/page.tsx
  -> home feature
  -> session feature
  -> auth/account features
  -> lib helpers and shared types
```

## Concepts To Know

- A feature folder owns behavior, not just files.
- If a helper only makes sense inside one domain, keep it inside that feature until reuse becomes real.
- Shared abstractions should be pulled down into `lib` or `types` only when multiple features truly depend on them.

## Common Change Scenarios

- Add a new feature folder when introducing a new product domain.
- Extend an existing feature folder when the behavior is part of the same user journey.
- Add leaf folders like `hooks`, `types`, or `utils` only when the feature has enough internal structure to justify them.

## Related READMEs

- [`../README.md`](../README.md)
- [`home/README.md`](./home/README.md)
- [`auth/README.md`](./auth/README.md)
- [`account/README.md`](./account/README.md)
- [`session/README.md`](./session/README.md)
