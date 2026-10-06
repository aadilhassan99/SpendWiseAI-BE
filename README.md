# SpendWiseAI Backend

NestJS REST API for the SpendWise AI personal finance analyzer (Milestone 1 foundation).

## Prerequisites

- Node.js 20+
- npm
- Docker and Docker Compose (for local PostgreSQL)

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

   Adjust values if needed. Do not commit `.env`.

3. Start PostgreSQL:

   ```bash
   docker compose up -d
   ```

4. Run database migrations:

   ```bash
   npm run migration:run
   ```

5. Start the API in watch mode:

   ```bash
   npm run start:dev
   ```

The server listens on `PORT` from `.env` (default `3001`). API routes are prefixed with `/api/v1`.

### API documentation

Swagger UI is available at `http://localhost:3001/api/v1/docs`. Register or log in from the UI to set the session cookie, then use the protected endpoints directly.

### Health check

```bash
curl http://localhost:3001/api/v1/health
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run start:dev` | Start with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run lint` | ESLint |
| `npm test` | Unit tests |
| `npm run test:e2e` | E2E tests (health, no DB required) |
| `npm run migration:run` | Apply pending migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run migration:generate -- src/database/migrations/MigrationName` | Generate migration from entity changes |

## Project structure

```
src/
  auth/           # Authentication (Milestone 2+)
  users/
  accounts/
  categories/
  transactions/
  analytics/
  config/         # Environment and TypeORM configuration
  database/       # TypeORM CLI data source and migrations
  common/         # Shared filters and utilities
  health/         # Health endpoint
```

## Configuration

- **`DATABASE_URL`**: PostgreSQL connection string, or set `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (and optionally `POSTGRES_HOST`, `POSTGRES_PORT`).
- **`CORS_ORIGIN`**: Allowed origin for the Next.js frontend.
- **`DATABASE_MIGRATIONS_RUN`**: Set to `true` to run migrations on application startup (optional; prefer `migration:run` in development).

TypeORM `synchronize` is **disabled**. Schema changes must go through migrations.

## Production notes

- Set `NODE_ENV=production`.
- Provide `DATABASE_URL` via your deployment secrets manager.
- Run `npm run build` and `npm run start:prod` after migrations are applied.
