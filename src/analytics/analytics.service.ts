import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SelectQueryBuilder, Repository } from 'typeorm';
import { AccountsService } from '../accounts/accounts.service';
import {
  Transaction,
  TransactionType,
} from '../transactions/entities/transaction.entity';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import {
  AnalyticsCategoriesResponseDto,
  AnalyticsPeriodDto,
  AnalyticsSummaryResponseDto,
  AnalyticsTrendsResponseDto,
  CategoryExpenseTotalDto,
  CurrencyTrendDto,
  SummaryTotalDto,
} from './dto/analytics-response.dto';

interface SummaryRow {
  currency: string;
  income: string;
  expenses: string;
  netCashFlow: string;
}

interface CategoryRow {
  categoryId: string | null;
  categoryName: string;
  currency: string;
  expenses: string;
}

interface TrendRow {
  month: string;
  currency: string;
  income: string;
  expenses: string;
}

interface ScopedAnalyticsQuery {
  period: AnalyticsPeriodDto;
  queryBuilder: SelectQueryBuilder<Transaction>;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly accountsService: AccountsService,
  ) {}

  async getSummary(
    userId: string,
    query: AnalyticsQueryDto,
  ): Promise<AnalyticsSummaryResponseDto> {
    const { period, queryBuilder } = await this.createScopedQuery(
      userId,
      query,
    );
    const rows = await queryBuilder
      .select('transaction.currency', 'currency')
      .addSelect(
        'COALESCE(SUM(CASE WHEN transaction.type = :incomeType THEN transaction.amount ELSE 0 END), 0)::text',
        'income',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN transaction.type = :expenseType THEN transaction.amount ELSE 0 END), 0)::text',
        'expenses',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN transaction.type = :incomeType THEN transaction.amount WHEN transaction.type = :expenseType THEN -transaction.amount ELSE 0 END), 0)::text',
        'netCashFlow',
      )
      .setParameters({
        incomeType: TransactionType.Income,
        expenseType: TransactionType.Expense,
      })
      .groupBy('transaction.currency')
      .orderBy('transaction.currency', 'ASC')
      .getRawMany<SummaryRow>();

    return { period, totals: rows.map((row) => this.toSummaryTotal(row)) };
  }

  async getCategories(
    userId: string,
    query: AnalyticsQueryDto,
  ): Promise<AnalyticsCategoriesResponseDto> {
    const { period, queryBuilder } = await this.createScopedQuery(
      userId,
      query,
    );
    const rows = await queryBuilder
      .leftJoin('transaction.category', 'category')
      .select('transaction.category_id', 'categoryId')
      .addSelect("COALESCE(category.name, 'Uncategorized')", 'categoryName')
      .addSelect('transaction.currency', 'currency')
      .addSelect('COALESCE(SUM(transaction.amount), 0)::text', 'expenses')
      .andWhere('transaction.type = :expenseType', {
        expenseType: TransactionType.Expense,
      })
      .groupBy('transaction.category_id')
      .addGroupBy('category.name')
      .addGroupBy('transaction.currency')
      .orderBy('transaction.currency', 'ASC')
      .addOrderBy("COALESCE(category.name, 'Uncategorized')", 'ASC')
      .getRawMany<CategoryRow>();

    return {
      period,
      categories: rows.map((row) => this.toCategoryExpenseTotal(row)),
    };
  }

  async getTrends(
    userId: string,
    query: AnalyticsQueryDto,
  ): Promise<AnalyticsTrendsResponseDto> {
    const { period, queryBuilder } = await this.createScopedQuery(
      userId,
      query,
    );
    const rows = await queryBuilder
      .select("TO_CHAR(transaction.transaction_date, 'YYYY-MM')", 'month')
      .addSelect('transaction.currency', 'currency')
      .addSelect(
        'COALESCE(SUM(CASE WHEN transaction.type = :incomeType THEN transaction.amount ELSE 0 END), 0)::text',
        'income',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN transaction.type = :expenseType THEN transaction.amount ELSE 0 END), 0)::text',
        'expenses',
      )
      .setParameters({
        incomeType: TransactionType.Income,
        expenseType: TransactionType.Expense,
      })
      .groupBy("TO_CHAR(transaction.transaction_date, 'YYYY-MM')")
      .addGroupBy('transaction.currency')
      .orderBy('transaction.currency', 'ASC')
      .addOrderBy("TO_CHAR(transaction.transaction_date, 'YYYY-MM')", 'ASC')
      .getRawMany<TrendRow>();

    const trends = new Map<string, CurrencyTrendDto>();
    for (const row of rows) {
      const trend = trends.get(row.currency) ?? {
        currency: row.currency,
        months: [],
      };
      trend.months.push({
        month: row.month,
        income: row.income,
        expenses: row.expenses,
      });
      trends.set(row.currency, trend);
    }

    return { period, trends: [...trends.values()] };
  }

  private async createScopedQuery(
    userId: string,
    query: AnalyticsQueryDto,
  ): Promise<ScopedAnalyticsQuery> {
    const period = this.resolvePeriod(query);
    if (query.accountId) {
      await this.accountsService.getOwnedAccount(userId, query.accountId);
    }

    const queryBuilder = this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.user_id = :userId', { userId })
      .andWhere('transaction.transaction_date >= :from', { from: period.from })
      .andWhere('transaction.transaction_date <= :to', { to: period.to });

    if (query.accountId) {
      queryBuilder.andWhere('transaction.account_id = :accountId', {
        accountId: query.accountId,
      });
    }
    if (query.currency) {
      queryBuilder.andWhere('transaction.currency = :currency', {
        currency: query.currency,
      });
    }

    return { period, queryBuilder };
  }

  private resolvePeriod(query: AnalyticsQueryDto): AnalyticsPeriodDto {
    const today = new Date();
    const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1);
    const period = {
      from: query.from ?? this.toDateString(defaultFrom),
      to: query.to ?? this.toDateString(today),
    };

    if (period.from > period.to) {
      throw new BadRequestException('from must be on or before to');
    }
    return period;
  }

  private toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toSummaryTotal(row: SummaryRow): SummaryTotalDto {
    return {
      currency: row.currency,
      income: row.income,
      expenses: row.expenses,
      netCashFlow: row.netCashFlow,
    };
  }

  private toCategoryExpenseTotal(row: CategoryRow): CategoryExpenseTotalDto {
    return {
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      currency: row.currency,
      expenses: row.expenses,
    };
  }
}
