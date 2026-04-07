# Home Components

## Purpose

This folder contains the components that assemble the visible home page.

## What Lives Here

- `home-page.tsx`: Top-level client component for the page.
- `marketing-panel.tsx`: Static explanatory panel about the stack.
- `user-access-panel.tsx`: Session-aware wrapper that chooses between auth and account UI.

## How It Fits Into The System

`HomePage` is the bridge between route-level rendering and feature-level interaction. It calls `useUserSession` once and passes the resulting session contract downward.

## Important Files

- [`home-page.tsx`](./home-page.tsx)
- [`marketing-panel.tsx`](./marketing-panel.tsx)
- [`user-access-panel.tsx`](./user-access-panel.tsx)

## Concepts To Know

- `ReturnType<typeof useUserSession>` in `UserAccessPanel` is a TypeScript way to say “this prop should match whatever the hook currently returns.”
- Presentation is split into smaller panels so the session-aware panel does not also own the marketing copy.

## Common Change Scenarios

- Change overall page composition in `home-page.tsx`.
- Change the stack explainer or visual framing in `marketing-panel.tsx`.
- Change logged-in versus logged-out conditional rendering in `user-access-panel.tsx`.

## Gotchas

- `home-page.tsx` is a client component because it uses a hook indirectly through `useUserSession`.
- `docsHref` is derived from the normalized API base URL, so it changes with environment.

## Related READMEs

- [`../README.md`](../README.md)
- [`../../session/README.md`](../../session/README.md)
- [`../../auth/README.md`](../../auth/README.md)
- [`../../account/README.md`](../../account/README.md)
