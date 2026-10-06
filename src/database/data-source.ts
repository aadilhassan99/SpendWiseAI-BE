import 'reflect-metadata';
import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for TypeORM CLI');
}

export default new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
});
