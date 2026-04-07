# aws-integration-repo

Current state:

- `frontend/`: Next.js 16 app with signup, login, logout, profile update, and delete-account UI
- `backend/`: NestJS 11 API with Swagger, Prisma, JWT cookie auth, and self-service user CRUD
- `db`: PostgreSQL 18.3 via Docker Compose

## Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: NestJS, Swagger, Prisma, bcrypt, JWT-in-cookie auth
- Database: PostgreSQL 18.3
- Local orchestration: Docker Compose

Note:

- Prisma is currently pinned to `6.18.0` in the backend for stable NestJS integration. It is not using Prisma 7.

## What Works

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /users/me`
- `PATCH /users/me`
- `DELETE /users/me`
- Swagger UI at `http://localhost:4000/docs`
- Frontend auth/profile flow at `http://localhost:3000`

## Repo Layout

```text
.
├── backend
│   ├── prisma
│   └── src
├── frontend
│   └── app
└── docker-compose.yml
```

## Environment Setup

Create local env files from the examples:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Current root `.env` variables:

```env
FRONTEND_PORT=3000
BACKEND_PORT=4000
POSTGRES_PORT=5432
POSTGRES_DB=app_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

Current backend `.env` variables:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@db:5432/app_db?schema=public
JWT_SECRET=replace-this-in-production
JWT_EXPIRES_IN=7d
COOKIE_NAME=auth_token
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Current frontend `.env` variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

For production or cloud deployment, override:

- `DATABASE_URL` to point at the real database
- `FRONTEND_URL` to the deployed frontend origin
- `NEXT_PUBLIC_API_URL` to the deployed API origin
- `JWT_SECRET` with a real secret
- `NODE_ENV=production` on the backend to enable secure cookies

## Running Locally With Docker

Start the full stack:

```bash
docker compose up --build
```

Run in the background:

```bash
docker compose up --build -d
```

Stop and remove containers:

```bash
docker compose down
```

Stop and remove containers plus volumes:

```bash
docker compose down -v
```

The compose stack does the following:

- starts PostgreSQL 18.3 with a healthcheck
- waits for the database before starting the backend
- runs Prisma generate and Prisma migrate deploy before the Nest dev server starts
- starts the frontend against `NEXT_PUBLIC_API_URL`

## Running Services Individually

Frontend:

```bash
cd frontend
pnpm install
pnpm dev
```

Backend:

```bash
cd backend
pnpm install
pnpm prisma:generate
pnpm start:dev
```

If you are running the backend outside Docker, `backend/.env` must use a database host reachable from your machine instead of the Compose hostname `db`.

## API Notes

Auth responses return a sanitized user object:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "createdAt": "2026-04-07T01:08:15.785Z",
  "updatedAt": "2026-04-07T01:08:24.292Z"
}
```

The API never returns `passwordHash`.

Authentication is handled with:

- JWT stored in an HttpOnly cookie
- `SameSite=Lax`
- `Secure=true` only when `NODE_ENV=production`

## Verification Status

These checks have already passed locally:

- `cd backend && pnpm build`
- `cd backend && pnpm lint`
- `cd backend && pnpm test:e2e`
- `cd frontend && pnpm build`
- `cd frontend && pnpm lint`
- `docker compose config`
- `docker compose up --build -d`
- live smoke test for signup, auth me, profile update, delete account, frontend page load, and Swagger page load

## Next Useful Steps

- add frontend integration tests or Playwright coverage
- add backend unit tests around auth and user services
- add production deployment docs for AWS
- add refresh-token or session-rotation support if auth needs to harden beyond the current basic flow
