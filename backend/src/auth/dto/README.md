# Auth DTOs

## Purpose

This folder contains request DTOs for auth endpoints.

## What Lives Here

- `login.dto.ts`: Validation and Swagger metadata for login.
- `signup.dto.ts`: Validation and Swagger metadata for signup.

## How It Fits Into The System

These DTO classes define the accepted request body shape before the controller reaches business logic.

## Concepts To Know

- `class-validator` decorators enforce runtime input rules.
- `@ApiProperty()` decorators tell Swagger how to document the request body.
- DTO classes are runtime-aware; plain type aliases are not enough for this job in Nest.

## Common Change Scenarios

- Add decorators here when auth input rules change.
- Keep DTO docs and actual service assumptions aligned.

## Related READMEs

- [`../README.md`](../README.md)
- [`../../users/dto/README.md`](../../users/dto/README.md)
