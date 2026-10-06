import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from './accounts/accounts.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import configuration from './config/configuration';
import { buildTypeOrmOptions } from './config/database.config';
import { validateEnvironment } from './config/env.validation';
import { HealthModule } from './health/health.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildTypeOrmOptions(configService),
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
