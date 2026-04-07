# Backend Prisma

## Purpose

This folder contains the database contract for the backend.

## What Lives Here

- `schema.prisma`: Prisma data model and datasource configuration.
- `migrations`: Migration history generated from schema changes.

## How It Fits Into The System

Prisma is the typed bridge between Nest services and PostgreSQL. Services do not build raw SQL in this repo. They call Prisma client methods instead.

## Concepts To Know

- The `datasource` block defines how Prisma reaches the database.
- The `generator` block defines how Prisma generates the client used by the backend.
- A Prisma model is the source of truth for both generated client types and migration generation.

## Common Change Scenarios

- Change `schema.prisma` when the database model changes.
- Generate and apply a new migration when schema changes need to persist in real databases.
- Update backend DTOs and frontend shared types if the API surface changes because of a schema change.

## Related READMEs

- [`migrations/README.md`](./migrations/README.md)
- [`../src/prisma/README.md`](../src/prisma/README.md)
- [`../README.md`](../README.md)
