# Auth Decorators

## Purpose

This folder contains auth-related custom parameter decorators.

## What Lives Here

- `current-user.decorator.ts`: Extracts the authenticated user object from the Nest execution context.

## How It Fits Into The System

The JWT strategy populates `request.user`. This decorator gives controllers a cleaner way to access that user without manually reading the raw request object in every handler.

## Concepts To Know

- A Nest parameter decorator transforms request context into a method parameter value.
- This is different from a TypeScript decorator used only for metadata. Here, the decorator participates in runtime request handling.

## Related READMEs

- [`../guards/README.md`](../guards/README.md)
- [`../strategies/README.md`](../strategies/README.md)
- [`../README.md`](../README.md)
