# Users Module

## Purpose

This module owns authenticated user account retrieval, update, deletion, email normalization, and user response sanitization.

## What Lives Here

- `users.module.ts`: Nest module for user-account behavior.
- `users.controller.ts`: Authenticated routes under `/api/users`.
- `users.service.ts`: Database logic and response shaping.
- `users.utils.ts`: User-specific helper functions.
- `dto`: Request and response DTO classes.

## How It Fits Into The System

The users module is the persistence-centered domain behind the auth module:

- Auth depends on it to find and create users.
- Protected account routes depend on it to fetch, update, and delete the current user.
- It is the module that actually talks to Prisma for user rows.

## Runtime/Data Flow

1. A protected users route passes through `JwtAuthGuard`.
2. `CurrentUser` exposes the authenticated identity.
3. `UsersService` reads or mutates the `User` row through Prisma.
4. `sanitizeUser` returns only the safe API-facing fields.

## Concepts To Know

- `sanitizeUser` is an important boundary. It prevents internal persistence fields like `passwordHash` from leaking into API responses.
- `normalizeEmail` is a small helper, but it expresses an application rule: emails are stored and compared in lowercase.

## Common Change Scenarios

- Add new user-facing fields by changing Prisma schema, DTOs, service logic, and frontend shared types together.
- Keep password hashing in the service layer, not in controllers.

## Related READMEs

- [`dto/README.md`](./dto/README.md)
- [`../auth/README.md`](../auth/README.md)
- [`../prisma/README.md`](../prisma/README.md)
