# Auth Components

## Purpose

This folder contains the UI shown when no authenticated session is active.

## What Lives Here

- `auth-panel.tsx`: Renders the signup/login toggle, auth form, submit button, and the small API/cookie explainer.

## How It Fits Into The System

`AuthPanel` is a controlled component. It receives form state and handlers from `useUserSession` rather than owning its own network logic.

## Important Files

- [`auth-panel.tsx`](./auth-panel.tsx)

## Concepts To Know

- `AuthMode` is a union type: `"login" | "signup"`. It constrains the mode to known values.
- `FormEvent<HTMLFormElement>` types the submit event so the handler contract matches a form submission.
- Controlled inputs keep the displayed value in sync with React state.

## Common Change Scenarios

- Add or change form fields here when the auth UI changes.
- Update `AuthFormState` and the submit payload logic in the session feature if the backend request contract changes.
- Keep the explanatory text aligned with real backend behavior, especially cookie and Swagger details.

## Gotchas

- The name field exists only in signup mode.
- The API explainer mentions `credentials: include` because that is a hard requirement for cookie auth in this repo.

## Related READMEs

- [`../README.md`](../README.md)
- [`../../session/README.md`](../../session/README.md)
- [`../../../lib/api/README.md`](../../../lib/api/README.md)
