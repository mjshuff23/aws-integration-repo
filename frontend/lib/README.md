# Frontend Lib

## Purpose

This folder contains lower-level helpers shared across frontend features.

## What Lives Here

- `api`: Shared request and error helpers.
- `env`: Runtime environment resolution logic.
- `format`: Display-oriented formatting helpers.

## How It Fits Into The System

`lib` sits below `features`. If a helper is no longer owned by one feature but still belongs only to the frontend, it usually moves here.

## Concepts To Know

- “Shared” does not mean “everything goes here.” Code should earn its way into `lib` by serving more than one local caller or by representing an obvious cross-feature boundary.

## Related READMEs

- [`api/README.md`](./api/README.md)
- [`env/README.md`](./env/README.md)
- [`format/README.md`](./format/README.md)
- [`../features/README.md`](../features/README.md)
