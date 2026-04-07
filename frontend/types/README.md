# Frontend Shared Types

## Purpose

This folder contains frontend-facing data shapes that are shared across features.

## What Lives Here

- `user.ts`: The frontend `User` shape returned by the backend and consumed by session/account UI.

## How It Fits Into The System

This is the frontend view of backend user data. It is shared because multiple features care about the same returned user fields.

## Concepts To Know

- This type mirrors backend response shape closely enough for UI use, but it is still a frontend-owned contract.
- `createdAt` and `updatedAt` are strings on the frontend because JSON serializes dates as strings.

## Common Change Scenarios

- Update this type when the backend user response shape changes.
- Cross-check backend DTO docs when editing this file so frontend and backend stay aligned.

## Related READMEs

- [`../features/session/README.md`](../features/session/README.md)
- [`../../backend/src/users/dto/README.md`](../../backend/src/users/dto/README.md)
- [`../README.md`](../README.md)
