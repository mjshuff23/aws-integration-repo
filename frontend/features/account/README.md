# Account Feature

## Purpose

This feature owns the authenticated user's account-management UI.

## What Lives Here

- `components`: Presentational account UI, currently centered on the profile panel.

## How It Fits Into The System

`account` is only rendered when `useUserSession` has an authenticated user. It is the “logged-in branch” of the main page.

## Concepts To Know

- This feature is intentionally presentational. The state and network logic live in the `session` feature, and the rendered UI lives here.
- That separation keeps account components easier to reuse and test mentally because they receive handlers and state instead of owning the request layer.

## Related READMEs

- [`components/README.md`](./components/README.md)
- [`../session/README.md`](../session/README.md)
- [`../README.md`](../README.md)
