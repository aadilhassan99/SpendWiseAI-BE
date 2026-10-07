import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsPositiveAmount } from '../../common/validators/is-positive-amount.decorator';
import {
  TransactionSourceType,
  TransactionStatus,
  TransactionType,
} from '../entities/transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  accountId: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: '125.50' })
  @IsString()
  @IsPositiveAmount()
  amount: string;

  @ApiProperty({ example: 'USD', pattern: '^[A-Z]{3}$' })
  @Transform(({ value }: { value: string }) => value?.toUpperCase())
  @Matches(/^[A-Z]{3}$/)
  currency: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.Expense })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 'Grocery shopping' })
  @IsString()
  @MaxLength(5000)
  description: string;

  @ApiPropertyOptional({ example: 'Whole Foods', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  merchant?: string;

  @ApiProperty({ format: 'date', example: '2026-01-15' })
  @IsDateString({ strict: true })
  transactionDate: string;

  @ApiProperty({
    enum: TransactionSourceType,
    example: TransactionSourceType.Manual,
  })
  @IsEnum(TransactionSourceType)
  sourceType: TransactionSourceType;

  @ApiProperty({
    enum: TransactionStatus,
    example: TransactionStatus.Confirmed,
  })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;
}
