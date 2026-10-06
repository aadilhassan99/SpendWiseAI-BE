import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export function buildTypeOrmOptions(
  configService: ConfigService,
): TypeOrmModuleOptions {
  const isProduction = configService.get<string>('nodeEnv') === 'production';

  return {
    type: 'postgres',
    url: configService.getOrThrow<string>('database.url'),
    autoLoadEntities: true,
    synchronize: false,
    migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
    migrationsRun: configService.get<boolean>('database.migrationsRun', false),
    logging: !isProduction,
  };
}
