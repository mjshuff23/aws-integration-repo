# Auth Module

## Purpose

This module owns signup, login, logout, current-user session lookup, cookie handling, and JWT authentication strategy setup.

## What Lives Here

- `auth.module.ts`: Nest module wiring for auth.
- `auth.controller.ts`: HTTP routes under `/api/auth`.
- `auth.service.ts`: Business logic for signup, login, and current-user resolution.
- `auth.utils.ts`: Cookie helper functions.
- `decorators`: Request parameter helper for the authenticated user.
- `dto`: Request-body validation and Swagger DTO classes.
- `guards`: Route protection primitives.
- `strategies`: Passport JWT strategy implementation.
- `types`: JWT payload and authenticated-user data shapes.

## How It Fits Into The System

The auth module sits between the public HTTP surface and the users module:

- It uses `UsersService` to read and create users.
- It signs JWTs with Nest's `JwtService`.
- It stores auth state in a cookie written to the response.
- It later reads that cookie back through the Passport JWT strategy.

## Runtime/Data Flow

1. Controller receives a signup or login request.
2. DTO validation runs before controller logic.
3. `AuthService` verifies or creates the user.
4. `AuthService` signs a JWT and attaches a cookie.
5. On protected routes, `JwtStrategy` extracts the cookie, validates the JWT, and the guard allows or rejects the request.

## Concepts To Know

- `JwtModule.registerAsync(...)` lets auth configuration depend on `ConfigService`.
- `PassportModule.register({ defaultStrategy: 'jwt' })` sets the module's default auth strategy.
- Auth in Nest is usually a pipeline: extractor/strategy -> guard -> route handler.

## Common Change Scenarios

- Add auth endpoints in the controller.
- Change cookie behavior in `auth.utils.ts`.
- Change identity payload structure in `types` and the strategy/service together.

## Related READMEs

- [`decorators/README.md`](./decorators/README.md)
- [`dto/README.md`](./dto/README.md)
- [`guards/README.md`](./guards/README.md)
- [`strategies/README.md`](./strategies/README.md)
- [`types/README.md`](./types/README.md)
- [`../users/README.md`](../users/README.md)
