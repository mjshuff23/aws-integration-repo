# Session Utils

## Purpose

This folder contains small pure helpers for frontend session-related form state.

## What Lives Here

- `form-state.ts`: Functions that create empty form objects and convert a backend `User` into profile form state.

## How It Fits Into The System

These helpers keep object-creation details out of components and hooks. That keeps the session hook focused on workflow rather than repetitive object construction.

## Concepts To Know

- A pure helper function returns a value based only on its inputs and has no side effects.
- Converters like `toProfileForm` are useful when backend response shape and editable form shape are related but not identical in meaning.

## Common Change Scenarios

- Add initialization helpers here when session form shapes evolve.
- Keep these functions side-effect free so they stay easy to trust and reuse.

## Related READMEs

- [`../README.md`](../README.md)
- [`../types/README.md`](../types/README.md)
- [`../../../types/README.md`](../../../types/README.md)
