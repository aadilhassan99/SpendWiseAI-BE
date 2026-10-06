const DEFAULT_PORT = 3001;

function buildDatabaseUrlFromParts(): string | undefined {
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const host = process.env.POSTGRES_HOST ?? 'localhost';
  const port = process.env.POSTGRES_PORT ?? '5432';
  const database = process.env.POSTGRES_DB;

  if (!user || !password || !database) {
    return undefined;
  }

  const encodedPassword = encodeURIComponent(password);
  return `postgresql://${user}:${encodedPassword}@${host}:${port}/${database}`;
}

function resolveDatabaseUrl(): string {
  const fromEnv = process.env.DATABASE_URL;
  if (fromEnv) {
    return fromEnv;
  }

  const fromParts = buildDatabaseUrlFromParts();
  if (fromParts) {
    return fromParts;
  }

  throw new Error(
    'Set DATABASE_URL or POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB',
  );
}

export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? String(DEFAULT_PORT), 10),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  database: {
    url: resolveDatabaseUrl(),
    migrationsRun: process.env.DATABASE_MIGRATIONS_RUN === 'true',
  },
});
