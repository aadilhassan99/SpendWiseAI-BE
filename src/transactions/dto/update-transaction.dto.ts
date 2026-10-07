import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsPositiveAmount } from '../../common/validators/is-positive-amount.decorator';
import {
  TransactionSourceType,
  TransactionStatus,
  TransactionType,
} from '../entities/transaction.entity';

export class UpdateTransactionDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsOptional()
  @ValidateIf((_, value: unknown) => value !== null)
  @IsUUID()
  categoryId?: string | null;

  @ApiPropertyOptional({ example: '125.50' })
  @IsOptional()
  @IsString()
  @IsPositiveAmount()
  amount?: string;

  @ApiPropertyOptional({ example: 'USD', pattern: '^[A-Z]{3}$' })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.toUpperCase())
  @Matches(/^[A-Z]{3}$/)
  currency?: string;

  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ example: 'Grocery shopping' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ example: 'Whole Foods', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  merchant?: string | null;

  @ApiPropertyOptional({ format: 'date', example: '2026-01-15' })
  @IsOptional()
  @IsDateString({ strict: true })
  transactionDate?: string;

  @ApiPropertyOptional({ enum: TransactionSourceType })
  @IsOptional()
  @IsEnum(TransactionSourceType)
  sourceType?: TransactionSourceType;

  @ApiPropertyOptional({ enum: TransactionStatus })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;
}
