/* eslint-disable @typescript-eslint/unbound-method -- Jest mock method references in expect() */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));
jest.mock('../accounts/accounts.service');
jest.mock('../categories/categories.service');

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AccountsService } from '../accounts/accounts.service';
import { CategoriesService } from '../categories/categories.service';
import { Category, CategoryType } from '../categories/entities/category.entity';
import { FinancialAccount } from '../accounts/entities/financial-account.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  ListTransactionsQueryDto,
  SortOrder,
  TransactionSortField,
} from './dto/list-transactions-query.dto';
import {
  Transaction,
  TransactionSourceType,
  TransactionStatus,
  TransactionType,
} from './entities/transaction.entity';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionsRepository: jest.Mocked<Repository<Transaction>>;
  let accountsService: jest.Mocked<AccountsService>;
  let categoriesService: jest.Mocked<CategoriesService>;
  let queryBuilder: jest.Mocked<SelectQueryBuilder<Transaction>>;

  const userId = '323e4567-e89b-12d3-a456-426614174002';
  const otherUserId = '423e4567-e89b-12d3-a456-426614174003';
  const accountId = '123e4567-e89b-12d3-a456-426614174000';
  const categoryId = '223e4567-e89b-12d3-a456-426614174001';
  const transactionId = '523e4567-e89b-12d3-a456-426614174004';

  const ownedAccount = {
    id: accountId,
    userId,
  } as FinancialAccount;

  const expenseCategory = {
    id: categoryId,
    userId,
    type: CategoryType.Expense,
  } as Category;

  const systemCategory = {
    id: categoryId,
    userId: null,
    type: CategoryType.Expense,
  } as Category;

  const baseTransaction = {
    id: transactionId,
    userId,
    accountId,
    categoryId,
    amount: '25.50',
    currency: 'USD',
    type: TransactionType.Expense,
    description: 'Coffee',
    merchant: 'Cafe',
    transactionDate: '2026-01-10',
    sourceType: TransactionSourceType.Manual,
    status: TransactionStatus.Confirmed,
    createdAt: new Date('2026-01-10T10:00:00.000Z'),
    updatedAt: new Date('2026-01-10T10:00:00.000Z'),
  } as Transaction;

  beforeEach(() => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    } as unknown as jest.Mocked<SelectQueryBuilder<Transaction>>;

    transactionsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    } as unknown as jest.Mocked<Repository<Transaction>>;

    accountsService = {
      getOwnedAccount: jest.fn(),
    } as unknown as jest.Mocked<AccountsService>;

    categoriesService = {
      getAccessibleCategory: jest.fn(),
      assertCategoryTypeMatches: jest.fn(),
    } as unknown as jest.Mocked<CategoriesService>;

    service = new TransactionsService(
      transactionsRepository,
      accountsService,
      categoriesService,
    );
  });

  describe('create', () => {
    const createDto: CreateTransactionDto = {
      accountId,
      categoryId,
      amount: '025.500000',
      currency: 'usd',
      type: TransactionType.Expense,
      description: 'Coffee',
      merchant: 'Cafe',
      transactionDate: '2026-01-10',
      sourceType: TransactionSourceType.Manual,
      status: TransactionStatus.Confirmed,
    };

    it('creates a transaction for the authenticated user', async () => {
      accountsService.getOwnedAccount.mockResolvedValue(ownedAccount);
      categoriesService.getAccessibleCategory.mockResolvedValue(
        expenseCategory,
      );
      transactionsRepository.create.mockReturnValue(baseTransaction);
      transactionsRepository.save.mockResolvedValue(baseTransaction);

      const result = await service.create(userId, createDto);

      expect(accountsService.getOwnedAccount).toHaveBeenCalledWith(
        userId,
        accountId,
      );
      expect(categoriesService.getAccessibleCategory).toHaveBeenCalledWith(
        userId,
        categoryId,
      );
      expect(transactionsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          accountId,
          categoryId,
          amount: '25.5',
          currency: 'USD',
        }),
      );
      expect(result.id).toBe(transactionId);
      expect(result.amount).toBe('25.50');
    });

    it('rejects inaccessible accounts via ownership check', async () => {
      accountsService.getOwnedAccount.mockRejectedValue(
        new NotFoundException('Account not found'),
      );

      await expect(service.create(userId, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('validates category ownership and type', async () => {
      accountsService.getOwnedAccount.mockResolvedValue(ownedAccount);
      categoriesService.getAccessibleCategory.mockResolvedValue(systemCategory);
      categoriesService.assertCategoryTypeMatches.mockImplementation(() => {
        throw new BadRequestException(
          'Category type must match the transaction type',
        );
      });

      await expect(service.create(userId, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('applies filters, sorting, and pagination metadata', async () => {
      const query: ListTransactionsQueryDto = {
        page: 2,
        limit: 10,
        from: '2026-01-01',
        to: '2026-01-31',
        accountId,
        categoryId,
        currency: 'eur',
        type: TransactionType.Expense,
        status: TransactionStatus.Confirmed,
        search: 'coffee',
        sortBy: TransactionSortField.Amount,
        sortOrder: SortOrder.Asc,
      };

      accountsService.getOwnedAccount.mockResolvedValue(ownedAccount);
      categoriesService.getAccessibleCategory.mockResolvedValue(
        expenseCategory,
      );
      queryBuilder.getManyAndCount.mockResolvedValue([[baseTransaction], 25]);

      const result = await service.findAll(userId, query);

      expect(accountsService.getOwnedAccount).toHaveBeenCalledWith(
        userId,
        accountId,
      );
      expect(categoriesService.getAccessibleCategory).toHaveBeenCalledWith(
        userId,
        categoryId,
      );
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'transaction.user_id = :userId',
        { userId },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.currency = :currency',
        { currency: 'EUR' },
      );
      expect(queryBuilder.skip).toHaveBeenCalledWith(10);
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.meta).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
      expect(result.data).toHaveLength(1);
    });

    it('rejects invalid date ranges', async () => {
      await expect(
        service.findAll(userId, {
          page: 1,
          limit: 20,
          from: '2026-02-01',
          to: '2026-01-01',
          sortBy: TransactionSortField.TransactionDate,
          sortOrder: SortOrder.Desc,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('returns only transactions owned by the user', async () => {
      transactionsRepository.findOneBy.mockResolvedValue(baseTransaction);

      const result = await service.findOne(userId, transactionId);

      expect(transactionsRepository.findOneBy).toHaveBeenCalledWith({
        id: transactionId,
        userId,
      });
      expect(result.userId).toBe(userId);
    });

    it('does not expose another user transaction', async () => {
      transactionsRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(otherUserId, transactionId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('re-validates account ownership when account changes', async () => {
      const nextAccountId = '623e4567-e89b-12d3-a456-426614174005';
      transactionsRepository.findOneBy.mockResolvedValue({
        ...baseTransaction,
      });
      accountsService.getOwnedAccount.mockResolvedValue({
        id: nextAccountId,
        userId,
      } as FinancialAccount);
      transactionsRepository.save.mockResolvedValue({
        ...baseTransaction,
        accountId: nextAccountId,
      });

      await service.update(userId, transactionId, { accountId: nextAccountId });

      expect(accountsService.getOwnedAccount).toHaveBeenCalledWith(
        userId,
        nextAccountId,
      );
    });
  });

  describe('remove', () => {
    it('hard deletes owned transactions only', async () => {
      transactionsRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.remove(userId, transactionId);

      expect(transactionsRepository.delete).toHaveBeenCalledWith({
        id: transactionId,
        userId,
      });
    });
  });
});
