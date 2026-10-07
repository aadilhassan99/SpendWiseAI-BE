import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountsService } from '../accounts/accounts.service';
import { CategoriesService } from '../categories/categories.service';
import { normalizePositiveDecimalString } from '../common/money/decimal-string';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  ListTransactionsQueryDto,
  SortOrder,
  TransactionSortField,
} from './dto/list-transactions-query.dto';
import {
  PaginatedTransactionsResponseDto,
  TransactionResponseDto,
} from './dto/transaction-response.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';

const SORT_COLUMN_MAP: Record<TransactionSortField, string> = {
  [TransactionSortField.TransactionDate]: 'transaction.transactionDate',
  [TransactionSortField.Amount]: 'transaction.amount',
  [TransactionSortField.CreatedAt]: 'transaction.createdAt',
  [TransactionSortField.UpdatedAt]: 'transaction.updatedAt',
  [TransactionSortField.Description]: 'transaction.description',
  [TransactionSortField.Merchant]: 'transaction.merchant',
  [TransactionSortField.Status]: 'transaction.status',
  [TransactionSortField.Type]: 'transaction.type',
};

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly accountsService: AccountsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(
    userId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    await this.accountsService.getOwnedAccount(
      userId,
      createTransactionDto.accountId,
    );

    if (createTransactionDto.categoryId) {
      const category = await this.categoriesService.getAccessibleCategory(
        userId,
        createTransactionDto.categoryId,
      );
      this.categoriesService.assertCategoryTypeMatches(
        category,
        createTransactionDto.type,
      );
    }

    const transaction = this.transactionsRepository.create({
      userId,
      accountId: createTransactionDto.accountId,
      categoryId: createTransactionDto.categoryId ?? null,
      amount: normalizePositiveDecimalString(createTransactionDto.amount),
      currency: createTransactionDto.currency.toUpperCase(),
      type: createTransactionDto.type,
      description: createTransactionDto.description,
      merchant: createTransactionDto.merchant ?? null,
      transactionDate: createTransactionDto.transactionDate,
      sourceType: createTransactionDto.sourceType,
      status: createTransactionDto.status,
    });

    const saved = await this.transactionsRepository.save(transaction);
    return this.toResponse(saved);
  }

  async findAll(
    userId: string,
    query: ListTransactionsQueryDto,
  ): Promise<PaginatedTransactionsResponseDto> {
    if (query.from && query.to && query.from > query.to) {
      throw new BadRequestException('from must be on or before to');
    }

    if (query.accountId) {
      await this.accountsService.getOwnedAccount(userId, query.accountId);
    }

    if (query.categoryId) {
      await this.categoriesService.getAccessibleCategory(
        userId,
        query.categoryId,
      );
    }

    const queryBuilder = this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.user_id = :userId', { userId });

    if (query.from) {
      queryBuilder.andWhere('transaction.transaction_date >= :from', {
        from: query.from,
      });
    }

    if (query.to) {
      queryBuilder.andWhere('transaction.transaction_date <= :to', {
        to: query.to,
      });
    }

    if (query.accountId) {
      queryBuilder.andWhere('transaction.account_id = :accountId', {
        accountId: query.accountId,
      });
    }

    if (query.categoryId) {
      queryBuilder.andWhere('transaction.category_id = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query.currency) {
      queryBuilder.andWhere('transaction.currency = :currency', {
        currency: query.currency.toUpperCase(),
      });
    }

    if (query.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: query.type });
    }

    if (query.status) {
      queryBuilder.andWhere('transaction.status = :status', {
        status: query.status,
      });
    }

    if (query.search) {
      const searchPattern = `%${this.escapeIlikePattern(query.search)}%`;
      queryBuilder.andWhere(
        '(transaction.description ILIKE :search OR transaction.merchant ILIKE :search)',
        { search: searchPattern },
      );
    }

    const sortColumn =
      SORT_COLUMN_MAP[query.sortBy] ??
      SORT_COLUMN_MAP[TransactionSortField.TransactionDate];
    const sortOrder = query.sortOrder === SortOrder.Asc ? 'ASC' : 'DESC';
    queryBuilder.orderBy(sortColumn, sortOrder);

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const [transactions, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: transactions.map((transaction) => this.toResponse(transaction)),
      meta: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    userId: string,
    transactionId: string,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.findOwnedTransaction(userId, transactionId);
    return this.toResponse(transaction);
  }

  async update(
    userId: string,
    transactionId: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.findOwnedTransaction(userId, transactionId);
    const nextType = updateTransactionDto.type ?? transaction.type;

    if (updateTransactionDto.accountId) {
      await this.accountsService.getOwnedAccount(
        userId,
        updateTransactionDto.accountId,
      );
      transaction.accountId = updateTransactionDto.accountId;
    }

    if (updateTransactionDto.categoryId !== undefined) {
      if (updateTransactionDto.categoryId === null) {
        transaction.categoryId = null;
      } else {
        const category = await this.categoriesService.getAccessibleCategory(
          userId,
          updateTransactionDto.categoryId,
        );
        this.categoriesService.assertCategoryTypeMatches(category, nextType);
        transaction.categoryId = updateTransactionDto.categoryId;
      }
    }

    if (updateTransactionDto.type !== undefined) {
      transaction.type = updateTransactionDto.type;
      if (transaction.categoryId) {
        const category = await this.categoriesService.getAccessibleCategory(
          userId,
          transaction.categoryId,
        );
        this.categoriesService.assertCategoryTypeMatches(
          category,
          updateTransactionDto.type,
        );
      }
    }

    if (updateTransactionDto.amount !== undefined) {
      transaction.amount = normalizePositiveDecimalString(
        updateTransactionDto.amount,
      );
    }

    if (updateTransactionDto.currency !== undefined) {
      transaction.currency = updateTransactionDto.currency.toUpperCase();
    }

    if (updateTransactionDto.description !== undefined) {
      transaction.description = updateTransactionDto.description;
    }

    if (updateTransactionDto.merchant !== undefined) {
      transaction.merchant = updateTransactionDto.merchant;
    }

    if (updateTransactionDto.transactionDate !== undefined) {
      transaction.transactionDate = updateTransactionDto.transactionDate;
    }

    if (updateTransactionDto.sourceType !== undefined) {
      transaction.sourceType = updateTransactionDto.sourceType;
    }

    if (updateTransactionDto.status !== undefined) {
      transaction.status = updateTransactionDto.status;
    }

    const saved = await this.transactionsRepository.save(transaction);
    return this.toResponse(saved);
  }

  async remove(userId: string, transactionId: string): Promise<void> {
    const result = await this.transactionsRepository.delete({
      id: transactionId,
      userId,
    });
    if (result.affected !== 1) {
      throw new NotFoundException('Transaction not found');
    }
  }

  private async findOwnedTransaction(
    userId: string,
    transactionId: string,
  ): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOneBy({
      id: transactionId,
      userId,
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  private escapeIlikePattern(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/%/g, '\\%')
      .replace(/_/g, '\\_');
  }

  private toResponse(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
      userId: transaction.userId,
      accountId: transaction.accountId,
      categoryId: transaction.categoryId,
      amount: transaction.amount,
      currency: transaction.currency,
      type: transaction.type,
      description: transaction.description,
      merchant: transaction.merchant,
      transactionDate: transaction.transactionDate,
      sourceType: transaction.sourceType,
      status: transaction.status,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
