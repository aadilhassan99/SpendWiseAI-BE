import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment = NodeEnvironment.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3001;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN: string = 'http://localhost:3000';

  @IsOptional()
  @IsString()
  DATABASE_URL?: string;

  @IsOptional()
  @IsString()
  POSTGRES_USER?: string;

  @IsOptional()
  @IsString()
  POSTGRES_PASSWORD?: string;

  @IsOptional()
  @IsString()
  POSTGRES_DB?: string;

  @IsOptional()
  @IsString()
  POSTGRES_HOST?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  POSTGRES_PORT?: number;

  @IsOptional()
  @IsString()
  DATABASE_MIGRATIONS_RUN?: string;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  const hasDatabaseUrl =
    typeof validated.DATABASE_URL === 'string' &&
    validated.DATABASE_URL.length > 0;
  const hasPostgresParts =
    Boolean(validated.POSTGRES_USER) &&
    Boolean(validated.POSTGRES_PASSWORD) &&
    Boolean(validated.POSTGRES_DB);

  if (!hasDatabaseUrl && !hasPostgresParts) {
    throw new Error(
      'Provide DATABASE_URL or POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB',
    );
  }

  if (
    validated.DATABASE_URL &&
    !validated.DATABASE_URL.startsWith('postgresql://') &&
    !validated.DATABASE_URL.startsWith('postgres://')
  ) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string');
  }

  if (validated.CORS_ORIGIN) {
    try {
      new URL(validated.CORS_ORIGIN);
    } catch {
      throw new Error('CORS_ORIGIN must be a valid URL');
    }
  }

  return validated as unknown as Record<string, unknown>;
}
