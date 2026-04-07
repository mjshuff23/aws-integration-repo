# Frontend API Helpers

## Purpose

This folder contains the shared HTTP request layer for the frontend.

## What Lives Here

- `api-request.ts`: Fetch wrapper and error-message normalization.

## How It Fits Into The System

The session hook depends on this helper instead of calling `fetch` directly for every request. That centralizes cookie behavior and error-message shaping.

## Important Files

- [`api-request.ts`](./api-request.ts)

## Concepts To Know

- `RequestInit` is the built-in TypeScript shape for fetch options.
- `apiRequest<T>` uses a generic type parameter `T` so callers can describe the response shape they expect.
- Generics describe compile-time intent. They do not validate the backend response at runtime.

## Common Change Scenarios

- Change this file if request defaults or error shaping should change globally.
- Keep per-endpoint payload construction in the feature hook unless many callers need the same behavior.

## Gotchas

- The helper always sends `credentials: "include"`.
- The helper assumes JSON responses or empty bodies. If the API starts returning other formats, this helper will need to evolve.

## Related READMEs

- [`../env/README.md`](../env/README.md)
- [`../../features/session/hooks/README.md`](../../features/session/hooks/README.md)
