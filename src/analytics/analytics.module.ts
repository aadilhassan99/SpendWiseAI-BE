import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from '../accounts/accounts.module';
import { AuthModule } from '../auth/auth.module';
import { Transaction } from '../transactions/entities/transaction.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    AuthModule,
    AccountsModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
