# Frontend Formatting Helpers

## Purpose

This folder contains small display-formatting helpers.

## What Lives Here

- `format-date.ts`: Formats ISO-like date strings into a user-facing US locale date/time string.

## How It Fits Into The System

Formatting is kept out of display components so components can focus on structure and interaction rather than locale formatting details.

## Concepts To Know

- `Intl.DateTimeFormat` is a browser/runtime internationalization API.
- Formatting helpers usually depend on presentation requirements and should stay separate from raw data models.

## Related READMEs

- [`../../features/account/components/README.md`](../../features/account/components/README.md)
- [`../README.md`](../README.md)
