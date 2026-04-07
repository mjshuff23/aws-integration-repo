# Backend Source

## Purpose

This folder contains the NestJS application source code.

## What Lives Here

- `app.module.ts`: Root Nest module.
- `main.ts`: Bootstrap entrypoint.
- `configure-app.ts`: Global application configuration.
- `auth`: Auth-specific HTTP and security logic.
- `users`: User-account routes and persistence orchestration.
- `prisma`: Nest provider wrapper around Prisma client.
- `health`: Lightweight health endpoint.

## How It Fits Into The System

This source tree is organized by application behavior, not by HTTP verb or framework primitive alone. The root files define app-wide behavior; subfolders define bounded pieces of the API.

## Concepts To Know

- `AppModule` is the composition root.
- Global middleware and global pipes live outside feature modules because they affect the whole app.
- Feature modules can still import each other when one domain depends on another, such as auth depending on users.

## Related READMEs

- [`auth/README.md`](./auth/README.md)
- [`users/README.md`](./users/README.md)
- [`prisma/README.md`](./prisma/README.md)
- [`health/README.md`](./health/README.md)
- [`../README.md`](../README.md)
