import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TransactionSourceType,
  TransactionStatus,
  TransactionType,
} from '../entities/transaction.entity';

export class TransactionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ format: 'uuid' })
  accountId: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  categoryId: string | null;

  @ApiProperty({ example: '125.50' })
  amount: string;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ enum: TransactionType })
  type: TransactionType;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional({ nullable: true })
  merchant: string | null;

  @ApiProperty({ format: 'date' })
  transactionDate: string;

  @ApiProperty({ enum: TransactionSourceType })
  sourceType: TransactionSourceType;

  @ApiProperty({ enum: TransactionStatus })
  status: TransactionStatus;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class PaginatedTransactionsResponseDto {
  @ApiProperty({ type: TransactionResponseDto, isArray: true })
  data: TransactionResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
