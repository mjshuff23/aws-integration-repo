# Account Components

## Purpose

This folder contains the UI that is shown after the user is authenticated.

## What Lives Here

- `account-panel.tsx`: Displays current user details, profile edit fields, logout, and delete-account actions.

## How It Fits Into The System

`AccountPanel` receives all state and handlers from `useUserSession` through `UserAccessPanel`. It does not fetch data directly.

## Important Files

- [`account-panel.tsx`](./account-panel.tsx)

## Concepts To Know

- Props are the component contract. They describe what the parent must provide.
- `ProfileFormState` is a TypeScript shape for controlled form values, not a runtime class.
- Formatting such as `formatDate` is delegated to `lib` so the component stays focused on presentation.

## Common Change Scenarios

- Add new account fields here if they are part of the profile-editing UI.
- Extend `ProfileFormState` in the session feature if the form data shape changes.
- Change button behavior by changing the handlers passed in, not by introducing fetch logic here unless ownership truly moves.

## Gotchas

- `onDeleteAccount` and `onLogout` are button handlers, not submit handlers.
- The password field is optional for updates and intentionally allows blank values.

## Related READMEs

- [`../README.md`](../README.md)
- [`../../session/README.md`](../../session/README.md)
- [`../../../lib/format/README.md`](../../../lib/format/README.md)
