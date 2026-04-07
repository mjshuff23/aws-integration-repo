# Session Types

## Purpose

This folder contains TypeScript shapes for frontend auth and profile form state.

## What Lives Here

- `forms.ts`: `AuthMode`, `AuthFormState`, and `ProfileFormState`.

## How It Fits Into The System

These types are shared contracts between the session hook and the components that render or edit form data.

## Concepts To Know

- A union type such as `"login" | "signup"` narrows a value to a known set of strings.
- Object types like `AuthFormState` and `ProfileFormState` describe data shape, not runtime validation.
- Because these are plain types, they disappear after compilation and do not exist at runtime.

## Common Change Scenarios

- Add fields here when a frontend form gains new inputs.
- Update related utils and component props at the same time so all controlled inputs stay aligned.

## Related READMEs

- [`../README.md`](../README.md)
- [`../hooks/README.md`](../hooks/README.md)
- [`../utils/README.md`](../utils/README.md)
