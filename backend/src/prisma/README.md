# Prisma Nest Integration

## Purpose

This folder adapts Prisma to Nest's dependency-injection and lifecycle model.

## What Lives Here

- `prisma.module.ts`: Exposes `PrismaService` as a Nest provider.
- `prisma.service.ts`: Extends `PrismaClient` and hooks into Nest startup/shutdown.

## How It Fits Into The System

Feature services such as `UsersService` do not create Prisma clients directly. They receive `PrismaService` through Nest DI.

## Concepts To Know

- Dependency injection means Nest constructs providers and gives them to classes that depend on them.
- Lifecycle hooks like `OnModuleInit` and `OnModuleDestroy` let a provider align external resources, such as DB connections, with app startup and shutdown.

## Related READMEs

- [`../../prisma/README.md`](../../prisma/README.md)
- [`../users/README.md`](../users/README.md)
- [`../README.md`](../README.md)
