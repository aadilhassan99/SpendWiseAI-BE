import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { FinancialAccount } from './entities/financial-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialAccount]), AuthModule],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
