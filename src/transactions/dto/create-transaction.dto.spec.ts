import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTransactionDto } from './create-transaction.dto';
import {
  TransactionSourceType,
  TransactionStatus,
  TransactionType,
} from '../entities/transaction.entity';

describe('CreateTransactionDto', () => {
  const validPayload = {
    accountId: '123e4567-e89b-12d3-a456-426614174000',
    categoryId: '223e4567-e89b-12d3-a456-426614174001',
    amount: '10.25',
    currency: 'usd',
    type: TransactionType.Expense,
    description: 'Lunch',
    merchant: 'Deli',
    transactionDate: '2026-01-15',
    sourceType: TransactionSourceType.Manual,
    status: TransactionStatus.Confirmed,
  };

  it('accepts valid payloads and normalizes currency', async () => {
    const dto = plainToInstance(CreateTransactionDto, validPayload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.currency).toBe('USD');
  });

  it('rejects non-positive amounts', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
      ...validPayload,
      amount: '0.00',
    });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'amount')).toBe(true);
  });

  it('rejects invalid currency codes', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
      ...validPayload,
      currency: 'US',
    });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'currency')).toBe(true);
  });

  it('rejects invalid transaction types', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
      ...validPayload,
      type: 'refund',
    });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'type')).toBe(true);
  });
});
