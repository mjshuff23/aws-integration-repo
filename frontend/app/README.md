# Frontend App Router

## Purpose

This folder is the Next.js App Router entry surface. It defines the route shell and hands real page behavior off to the feature layer.

## What Lives Here

- `layout.tsx`: Global HTML structure, fonts, and metadata.
- `page.tsx`: The `/` route entrypoint.
- `globals.css`: Tailwind import plus small global theme values.

## How It Fits Into The System

The App Router is the framework-owned part of the frontend. It answers “which route exists?” while `features` answers “how does the product behave?”

That split keeps route files thin and prevents product logic from getting trapped in framework entrypoints.

## Important Files

- [`layout.tsx`](./layout.tsx)
- [`page.tsx`](./page.tsx)
- [`globals.css`](./globals.css)

## Concepts To Know

- App Router route files are server components by default.
- A server component can render a client component without becoming one itself.
- `Metadata` in `layout.tsx` is the typed way to declare document-level metadata in Next.js.

## Common Change Scenarios

- Change `page.tsx` only when route-level composition changes.
- Change `layout.tsx` for global metadata, font setup, or document shell concerns.
- Change `globals.css` only for styles that truly belong at app scope.

## Gotchas

- Do not move feature state into `app` just because a route renders it.
- `globals.css` is intentionally small. If a style is local to one panel, keep it in component classes instead.

## Related READMEs

- [`../README.md`](../README.md)
- [`../features/README.md`](../features/README.md)
