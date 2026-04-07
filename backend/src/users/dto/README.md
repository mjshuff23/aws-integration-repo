# User DTOs

## Purpose

This folder contains request and response DTOs for user-account routes.

## What Lives Here

- `update-user.dto.ts`: Validation rules for profile updates.
- `user-response.dto.ts`: Swagger-documented API response shape for user payloads.

## How It Fits Into The System

These classes define the contract between backend user routes and their callers.

## Concepts To Know

- `UpdateUserDto` validates incoming writes.
- `UserResponseDto` documents outgoing responses, but the actual data is produced by `UsersService.sanitizeUser`.
- Response DTOs and frontend shared types should stay aligned even though they live in different apps.

## Related READMEs

- [`../README.md`](../README.md)
- [`../../../../frontend/types/README.md`](../../../../frontend/types/README.md)
