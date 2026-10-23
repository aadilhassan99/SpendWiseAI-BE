jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));
jest.mock('../accounts/accounts.service');

import { BadRequestException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  const userId = '323e4567-e89b-12d3-a456-426614174002';
  const accountId = '123e4567-e89b-12d3-a456-426614174000';

  let service: AnalyticsService;
  let getRawMany: jest.Mock;
  let accountsService: { getOwnedAccount: jest.Mock };
  let queryBuilder: Record<string, jest.Mock>;

  beforeEach(() => {
    getRawMany = jest.fn();
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      getRawMany,
    };
    accountsService = { getOwnedAccount: jest.fn().mockResolvedValue({}) };
    service = new AnalyticsService(
      {
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      } as never,
      accountsService as never,
    );
  });

  it('returns no totals when the scoped query has no transactions', async () => {
    getRawMany.mockResolvedValue([]);

    await expect(
      service.getSummary(userId, { from: '2026-07-01', to: '2026-07-31' }),
    ).resolves.toEqual({
      period: { from: '2026-07-01', to: '2026-07-31' },
      totals: [],
    });
  });

  it('returns one currency summary using database-provided decimal strings', async () => {
    getRawMany.mockResolvedValue([
      {
        currency: 'PKR',
        income: '250000.000000',
        expenses: '85000.000000',
        netCashFlow: '165000.000000',
      },
    ]);

    const result = await service.getSummary(userId, {
      from: '2026-07-01',
      to: '2026-07-31',
    });

    expect(result.totals).toEqual([
      {
        currency: 'PKR',
        income: '250000.000000',
        expenses: '85000.000000',
        netCashFlow: '165000.000000',
      },
    ]);
    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      expect.stringContaining('SUM(CASE WHEN transaction.type'),
      'income',
    );
  });

  it('keeps multiple currencies in separate summary totals', async () => {
    getRawMany.mockResolvedValue([
      {
        currency: 'PKR',
        income: '250000.000000',
        expenses: '85000.000000',
        netCashFlow: '165000.000000',
      },
      {
        currency: 'USD',
        income: '1000.000000',
        expenses: '250.000000',
        netCashFlow: '750.000000',
      },
    ]);

    const result = await service.getSummary(userId, {
      from: '2026-07-01',
      to: '2026-07-31',
    });

    expect(result.totals).toHaveLength(2);
    expect(result.totals.map((total) => total.currency)).toEqual([
      'PKR',
      'USD',
    ]);
    expect(queryBuilder.groupBy).toHaveBeenCalledWith('transaction.currency');
  });

  it('applies the authenticated user, date range, and currency to aggregate queries', async () => {
    getRawMany.mockResolvedValue([]);

    await service.getSummary(userId, {
      from: '2026-07-01',
      to: '2026-07-31',
      currency: 'PKR',
    });

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'transaction.user_id = :userId',
      { userId },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'transaction.transaction_date >= :from',
      { from: '2026-07-01' },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'transaction.transaction_date <= :to',
      { to: '2026-07-31' },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'transaction.currency = :currency',
      { currency: 'PKR' },
    );
  });

  it('checks account ownership before applying an account filter', async () => {
    getRawMany.mockResolvedValue([]);

    await service.getSummary(userId, {
      from: '2026-07-01',
      to: '2026-07-31',
      accountId,
    });

    expect(accountsService.getOwnedAccount).toHaveBeenCalledWith(
      userId,
      accountId,
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'transaction.account_id = :accountId',
      { accountId },
    );
  });

  it('rejects an invalid date range before querying transactions', async () => {
    await expect(
      service.getSummary(userId, { from: '2026-08-01', to: '2026-07-31' }),
    ).rejects.toThrow(BadRequestException);
    expect(queryBuilder.where).not.toHaveBeenCalled();
  });

  it('returns expense category totals without mixing currencies', async () => {
    getRawMany.mockResolvedValue([
      {
        categoryId: '223e4567-e89b-12d3-a456-426614174001',
        categoryName: 'Groceries',
        currency: 'PKR',
        expenses: '85000.000000',
      },
      {
        categoryId: '223e4567-e89b-12d3-a456-426614174001',
        categoryName: 'Groceries',
        currency: 'USD',
        expenses: '250.000000',
      },
    ]);

    const result = await service.getCategories(userId, {
      from: '2026-07-01',
      to: '2026-07-31',
    });

    expect(result.categories).toHaveLength(2);
    expect(result.categories.map((category) => category.currency)).toEqual([
      'PKR',
      'USD',
    ]);
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'transaction.type = :expenseType',
      { expenseType: 'expense' },
    );
  });

  it('groups monthly income and expenses into separate currency trends', async () => {
    getRawMany.mockResolvedValue([
      {
        month: '2026-07',
        currency: 'PKR',
        income: '200000.000000',
        expenses: '90000.000000',
      },
      {
        month: '2026-08',
        currency: 'PKR',
        income: '220000.000000',
        expenses: '95000.000000',
      },
      {
        month: '2026-08',
        currency: 'USD',
        income: '1000.000000',
        expenses: '250.000000',
      },
    ]);

    const result = await service.getTrends(userId, {
      from: '2026-07-01',
      to: '2026-08-31',
    });

    expect(result.trends).toEqual([
      {
        currency: 'PKR',
        months: [
          {
            month: '2026-07',
            income: '200000.000000',
            expenses: '90000.000000',
          },
          {
            month: '2026-08',
            income: '220000.000000',
            expenses: '95000.000000',
          },
        ],
      },
      {
        currency: 'USD',
        months: [
          {
            month: '2026-08',
            income: '1000.000000',
            expenses: '250.000000',
          },
        ],
      },
    ]);
    expect(queryBuilder.groupBy).toHaveBeenCalledWith(
      "TO_CHAR(transaction.transaction_date, 'YYYY-MM')",
    );
  });
});
