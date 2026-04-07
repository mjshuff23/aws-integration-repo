# Session Feature

## Purpose

This feature owns frontend session state, auth/profile form state, and the request/response workflow that keeps the UI aligned with the backend.

## What Lives Here

- `hooks`: Interactive state and side-effect ownership.
- `types`: Form-state shapes and unions.
- `utils`: Small pure helpers for form initialization and conversion.

## How It Fits Into The System

This is the behavioral center of the frontend. Other features mostly render UI; this feature decides what the UI should show and when network requests happen.

## Runtime/Data Flow

1. `useUserSession` loads the current user on mount.
2. If the backend returns a user, the account branch is rendered.
3. If the backend returns 401, the auth branch is rendered.
4. Form helpers initialize or transform state as needed.
5. Successful auth/profile actions update the in-memory user and form state.

## Concepts To Know

- Hooks are React's way to share stateful behavior.
- `useTransition` marks non-urgent UI updates so interactions feel smoother.
- `useEffectEvent` lets async logic read the latest values without forcing it into the main effect dependency model.
- The types in this folder are compile-time contracts, while the utils are runtime helper functions.

## Common Change Scenarios

- Add request and state behavior in `hooks`.
- Add or adjust form field contracts in `types`.
- Add pure transformation helpers in `utils`.

## Gotchas

- This hook is the single source of truth for current user state on the frontend.
- Errors and success messages are UI state, not backend state. Keep that distinction clear when editing the hook.

## Related READMEs

- [`hooks/README.md`](./hooks/README.md)
- [`types/README.md`](./types/README.md)
- [`utils/README.md`](./utils/README.md)
- [`../../lib/api/README.md`](../../lib/api/README.md)
