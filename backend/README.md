# Backend

## Purpose

This app is the server-side half of the stack. It exposes a small auth and account API, validates incoming requests, manages cookie-based JWT auth, talks to PostgreSQL through Prisma, and documents its routes through Swagger.

This backend is also a good learning surface for NestJS because it uses several of Nest's core abstractions in one coherent workflow:

- modules
- controllers
- services
- DTOs
- guards
- passport strategies
- global app configuration

## What Lives Here

- `src`: Application source code grouped by Nest module or subsystem.
- `prisma`: Prisma schema and migration history.
- `test`: End-to-end tests that exercise the real HTTP API against PostgreSQL.
- `Dockerfile`: Production-style image build for local Compose and ECS.
- `package.json`: Scripts, dependencies, and Jest configuration.

## How It Fits Into The System

The frontend talks to this backend over HTTP, and this backend is the only process that talks directly to the database.

```text
Browser
  -> frontend fetch with credentials
  -> Nest controller
  -> service
  -> Prisma
  -> PostgreSQL
```

The backend also owns a few cross-cutting runtime policies:

- All routes are prefixed with `/api`.
- Swagger is served at `/api/docs`.
- Request validation is global.
- CORS allows the configured frontend origin and credentials.
- Auth state is read from an HttpOnly cookie rather than from an `Authorization` header.

## Runtime/Data Flow

### Bootstrap flow

1. `main.ts` creates the Nest application from `AppModule`.
2. `ConfigModule` loads env values from `.env.local` and `.env`.
3. `configureApp` applies global middleware and framework-wide configuration.
4. The app listens on `PORT`, defaulting to `4000`.

### Auth flow

1. `POST /api/auth/signup` creates a user, hashes the password, signs a JWT, and sets the auth cookie.
2. `POST /api/auth/login` verifies credentials, signs a JWT, and sets the auth cookie.
3. `GET /api/auth/me` is guarded by Passport JWT auth and returns the current user.
4. `POST /api/auth/logout` clears the auth cookie.
5. `PATCH /api/users/me` and `DELETE /api/users/me` also require the JWT guard.

### Request validation flow

- DTO classes use `class-validator` decorators.
- The global `ValidationPipe` enforces those rules.
- `whitelist: true` strips unknown fields.
- `forbidNonWhitelisted: true` turns unexpected fields into validation errors.
- `transform: true` allows Nest to transform payloads into DTO class instances.

### Database flow

- `PrismaService` extends `PrismaClient`.
- Nest creates it as a provider through `PrismaModule`.
- The service connects on module init and disconnects on module destroy.
- Services such as `UsersService` use it for actual queries and mutations.

## Important Files

- [`src/main.ts`](./src/main.ts): Application bootstrap.
- [`src/configure-app.ts`](./src/configure-app.ts): Global Nest runtime configuration.
- [`src/app.module.ts`](./src/app.module.ts): Root Nest module.
- [`src/auth/auth.service.ts`](./src/auth/auth.service.ts): Signup/login/session-cookie logic.
- [`src/auth/strategies/jwt.strategy.ts`](./src/auth/strategies/jwt.strategy.ts): Reads JWTs from cookies.
- [`src/users/users.service.ts`](./src/users/users.service.ts): User CRUD behavior and sanitization.
- [`prisma/schema.prisma`](./prisma/schema.prisma): Database model contract.
- [`test/app.e2e-spec.ts`](./test/app.e2e-spec.ts): API-level behavior check.

## API Surface

All routes live under `/api`:

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `DELETE /api/users/me`

Swagger UI is available at `http://localhost:4000/api/docs` in local development.

## Concepts To Know

### Modules

- A Nest module groups related providers and controllers.
- `AppModule` is the root composition point.
- `AuthModule`, `UsersModule`, and `PrismaModule` are the main building blocks in this repo.

### Controllers and services

- Controllers define the HTTP surface.
- Services hold business logic and data-access orchestration.
- Keeping controllers thin helps keep request handling readable and testable.

### DTO classes

- A DTO in Nest is usually a class, not just a type alias.
- That is because decorators such as `@IsEmail()` and `@MinLength()` attach runtime validation metadata to the class fields.
- DTOs in this repo also carry Swagger metadata through `@ApiProperty()` decorators.

### Guards and strategies

- A strategy answers “how do we authenticate this request?”
- A guard answers “should this route proceed?”
- Here, the JWT strategy reads the cookie and turns its payload into a user identity. The JWT guard applies that strategy to protected routes.

### Cookie-based JWT auth

- The JWT is signed on the server and stored in an HttpOnly cookie.
- The browser sends it automatically when the frontend includes credentials.
- This keeps token storage out of local storage and session storage.

### Prisma lifecycle integration

- Prisma itself is not a Nest concept.
- `PrismaService` adapts Prisma to Nest's provider lifecycle so connection management follows application startup and shutdown.

## Environment Setup

Create the backend env file from the example:

```bash
cp backend/.env.example backend/.env
```

Current example values:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@db:5432/app_db?schema=public
JWT_SECRET=replace-this-in-production
JWT_EXPIRES_IN=7d
COOKIE_NAME=auth_token
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Important notes:

- `db` is the Compose hostname, so that `DATABASE_URL` is correct inside Docker.
- If you run the backend directly on your machine, you may need `localhost` or another reachable host instead.
- In AWS production, `DATABASE_URL` and `JWT_SECRET` come from Secrets Manager rather than from a checked-in env file.

## Commands

Install:

```bash
pnpm install
```

Generate Prisma client:

```bash
pnpm prisma:generate
```

Run in watch mode:

```bash
pnpm start:dev
```

Build:

```bash
pnpm build
```

Run production build:

```bash
pnpm start:prod
```

Docker-oriented startup:

```bash
pnpm start:docker
```

## Tests

Lint:

```bash
pnpm lint
```

Unit test command placeholder:

```bash
pnpm test
```

End-to-end tests:

```bash
pnpm test:e2e
```

Coverage:

```bash
pnpm test:cov
```

The meaningful backend safety net in this repo is the e2e test because it exercises:

- routing
- validation
- auth cookie behavior
- Prisma persistence
- account update and deletion flows

## Common Change Scenarios

### Add a new protected route

1. Decide which module owns it.
2. Add a controller method.
3. Add or reuse DTO classes if request validation changes.
4. Apply `JwtAuthGuard` if the route requires an authenticated user.
5. Implement business logic in the owning service.

### Change the auth cookie behavior

1. Start in `src/auth/auth.utils.ts`.
2. Check `JwtStrategy` because cookie extraction and cookie writing must stay aligned.
3. Confirm frontend requests still use credentials.

### Change the user response shape

1. Update `UserResponseDto`.
2. Update `UsersService.sanitizeUser`.
3. Update frontend shared types and session assumptions.

## Gotchas

- The backend expects the frontend origin from `FRONTEND_URL`. If that is wrong, browser requests can fail even though Postman or curl still works.
- JWT auth here comes from cookies, not `Authorization` headers.
- The frontend depends on the backend route prefix being `/api`.
- Prisma migrations are part of deployment, not just local development. Schema changes affect app code, tests, Docker, and the deploy workflow together.

## Related READMEs

- [`../README.md`](../README.md)
- [`src/README.md`](./src/README.md)
- [`prisma/README.md`](./prisma/README.md)
- [`test/README.md`](./test/README.md)
- [`../frontend/README.md`](../frontend/README.md)
