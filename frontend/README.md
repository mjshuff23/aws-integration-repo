# Frontend

## Purpose

This app is the browser-facing part of the stack. It renders a marketing-plus-account page, boots the current session, submits auth and profile requests to the Nest API, and displays backend responses without storing auth tokens in JavaScript-managed browser storage.

The frontend is intentionally small, which makes it a good place to learn how Next.js App Router, React 19, Tailwind CSS v4, and TypeScript boundaries work together in a real project.

## What Lives Here

- `app`: App Router entry files such as the root layout and the `/` route.
- `features`: Product-oriented UI and state ownership, grouped by domain instead of by framework primitive.
- `lib`: Lower-level helpers used across features.
- `types`: Shared frontend-only or frontend-facing data shapes.
- `public`: Static assets served directly by Next.js, including generated infrastructure diagrams.
- `next.config.ts`: Frontend-wide Next.js options. This repo enables the React Compiler here.
- `package.json`: Frontend scripts and dependencies.

## How It Fits Into The System

This app does not proxy requests through custom Next.js API routes. Instead, browser code calls the backend directly and relies on shared-origin or cross-origin cookies depending on environment.

```text
Page load
  -> Next.js route renders HomePage
  -> HomePage calls useUserSession()
  -> hook fetches GET /api/auth/me
  -> backend returns current user or 401
  -> UI chooses AuthPanel or AccountPanel
```

That directness matters when you reason about bugs:

- If a request fails in the browser, you often need to inspect both frontend fetch behavior and backend CORS/cookie behavior.
- If auth looks inconsistent, check cookie handling first, not local storage or context providers. There are none here.

## Runtime/Data Flow

### Rendering model

- `app/page.tsx` is a route entrypoint.
- `HomePage` is a client component because it uses hooks and browser-only interactivity.
- The route file itself stays small and hands real work to the feature layer.

### Session model

- `useUserSession` is the frontend state machine for this app.
- It bootstraps with `GET /auth/me`.
- It holds form state for signup/login and profile editing.
- It submits requests through `apiRequest`.
- It keeps the displayed user state in sync with backend responses.

### API base URL model

- `NEXT_PUBLIC_API_URL` is normalized by `lib/env/api-base-url.ts`.
- In development, the fallback is `http://localhost:4000/api`.
- In production, the fallback is `/api`.
- The helper ensures the final base URL always ends with `/api`, which reduces accidental mismatches between env values and actual route prefixes.

### Auth model

- Every request uses `credentials: "include"`.
- The backend writes a signed JWT into an HttpOnly cookie.
- The browser never reads that cookie directly.
- Auth state is inferred from backend responses, not from decoding a token in the client.

## Important Files

- [`app/page.tsx`](./app/page.tsx): Route entrypoint for the home page.
- [`app/architecture/page.tsx`](./app/architecture/page.tsx): Route entrypoint for the infrastructure view.
- [`app/layout.tsx`](./app/layout.tsx): Global HTML shell and metadata.
- [`features/architecture/components/architecture-page.tsx`](./features/architecture/components/architecture-page.tsx): Human-readable context around the generated Terraform diagram.
- [`features/home/components/home-page.tsx`](./features/home/components/home-page.tsx): Top-level page composition.
- [`features/session/hooks/use-user-session.ts`](./features/session/hooks/use-user-session.ts): Central interactive state and request flow.
- [`lib/api/api-request.ts`](./lib/api/api-request.ts): Shared fetch wrapper and error normalization.
- [`lib/env/api-base-url.ts`](./lib/env/api-base-url.ts): Environment-to-runtime API base URL logic.
- [`next.config.ts`](./next.config.ts): Enables the React Compiler.
- [`app/globals.css`](./app/globals.css): Tailwind import and small global theme setup.

## Concepts To Know

### App Router

- In Next.js App Router, folders under `app` define routes and layouts.
- Route files are server components by default.
- A server component can render a client component, which is exactly what `app/page.tsx` does by returning `HomePage`.

### `"use client"`

- `"use client"` changes the execution environment of a file.
- Client components can use hooks like `useState`, `useEffect`, and browser APIs like `window.confirm`.
- They are appropriate for forms, transitions, interactive panels, and session bootstrapping in this repo.

### Feature folders

- This repo prefers domain ownership over framework ownership.
- Instead of putting all hooks together or all components together globally, auth/session/account/home code stays close to the feature it supports.
- That makes “what owns this behavior?” easier to answer.

### React 19 + compiler

- React 19 introduces newer primitives used here such as `useEffectEvent` and `useTransition`.
- The React Compiler is enabled in `next.config.ts`.
- Because of that, the codebase does not default to defensive `useMemo` and `useCallback` usage everywhere.

### Tailwind CSS v4

- Tailwind is loaded via `@import "tailwindcss"` in `app/globals.css`.
- Most styling is co-located in component `className` strings.
- There is very little global CSS, which keeps visual reasoning mostly local to the component tree.

## Common Change Scenarios

### Add a new UI flow

1. Decide which feature owns the behavior.
2. Put route-level composition in `app` only if routing changes.
3. Keep the interactive state machine near the feature if it is not broadly reusable.
4. Add a README if the new folder introduces a new abstraction boundary.

### Add a new backend call

1. Prefer reusing `apiRequest`.
2. Keep the request/response type near the feature unless it becomes broadly shared.
3. Think through whether the call requires cookies. Most authenticated calls here do.

### Change the public API origin

1. Check `NEXT_PUBLIC_API_URL`.
2. Check `lib/env/api-base-url.ts` normalization rules.
3. Confirm the backend global prefix is still `/api`.

## Getting Started

Install dependencies and run the dev server:

```bash
pnpm install
pnpm dev
```

Build for production:

```bash
pnpm build
pnpm start
```

Lint:

```bash
pnpm lint
```

The frontend expects `frontend/.env` or an equivalent environment with:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Gotchas

- If you remove `"use client"` from an interactive file, hooks and browser APIs will stop working.
- If `NEXT_PUBLIC_API_URL` is missing a trailing `/api`, the helper will add it. That is deliberate and worth remembering when debugging URLs.
- A 401 from the backend is turned into the user-facing message `"Your session is not active."` by the shared fetch helper.
- `public/` is empty today, so adding assets there is a product decision, not a refactor of existing behavior.

## Related READMEs

- [`../README.md`](../README.md)
- [`app/README.md`](./app/README.md)
- [`features/README.md`](./features/README.md)
- [`lib/README.md`](./lib/README.md)
- [`types/README.md`](./types/README.md)
