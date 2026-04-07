# Frontend Public Assets

## Purpose

This folder is where static files would go if the app needed images, icons, downloads, or other assets that should be served directly by Next.js.

## What Lives Here

- `architecture/terraform-inframap.svg`: Generated Terraform topology diagram for the `/architecture` route.
- `architecture/inframap-assets/`: AWS service icons referenced by the generated SVG.

## How It Fits Into The System

Files placed here are served as static assets rather than bundled React modules. That makes this folder the right home for things like logos, social preview images, or downloadable files.

In this repo it also holds generated infrastructure artifacts that should be
published directly by Next.js without passing through the backend.

## Gotchas

- The architecture SVG is generated output, not hand-authored source.
- Regenerate it with `./scripts/infra.sh diagram` after meaningful Terraform changes.
- Do not put assets here if they are better modeled as imported modules inside the React tree.

## Related READMEs

- [`../README.md`](../README.md)
