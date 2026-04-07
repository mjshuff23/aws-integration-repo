# Auth Feature

## Purpose

This feature owns the unauthenticated access UI: signup and login.

## What Lives Here

- `components`: Presentational auth UI, currently the auth panel.

## How It Fits Into The System

`auth` is rendered when the frontend has no active user session. It is the “logged-out branch” of the main page.

## Concepts To Know

- This feature does not own the actual auth state machine. The `session` feature does.
- It exists so auth-specific UI stays separate from authenticated account UI even though both appear on the same page shell.

## Related READMEs

- [`components/README.md`](./components/README.md)
- [`../session/README.md`](../session/README.md)
- [`../README.md`](../README.md)
