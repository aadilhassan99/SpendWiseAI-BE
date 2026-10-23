import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsPeriodDto {
  @ApiProperty({ format: 'date', example: '2026-07-01' })
  from: string;

  @ApiProperty({ format: 'date', example: '2026-07-31' })
  to: string;
}

export class SummaryTotalDto {
  @ApiProperty({ example: 'PKR' })
  currency: string;

  @ApiProperty({ example: '250000.000000' })
  income: string;

  @ApiProperty({ example: '85000.000000' })
  expenses: string;

  @ApiProperty({ example: '165000.000000' })
  netCashFlow: string;
}

export class AnalyticsSummaryResponseDto {
  @ApiProperty({ type: AnalyticsPeriodDto })
  period: AnalyticsPeriodDto;

  @ApiProperty({ type: SummaryTotalDto, isArray: true })
  totals: SummaryTotalDto[];
}

export class CategoryExpenseTotalDto {
  @ApiProperty({ format: 'uuid', nullable: true })
  categoryId: string | null;

  @ApiProperty({ example: 'Groceries' })
  categoryName: string;

  @ApiProperty({ example: 'PKR' })
  currency: string;

  @ApiProperty({ example: '85000.000000' })
  expenses: string;
}

export class AnalyticsCategoriesResponseDto {
  @ApiProperty({ type: AnalyticsPeriodDto })
  period: AnalyticsPeriodDto;

  @ApiProperty({ type: CategoryExpenseTotalDto, isArray: true })
  categories: CategoryExpenseTotalDto[];
}

export class MonthlyTrendDto {
  @ApiProperty({ example: '2026-07' })
  month: string;

  @ApiProperty({ example: '200000.000000' })
  income: string;

  @ApiProperty({ example: '90000.000000' })
  expenses: string;
}

export class CurrencyTrendDto {
  @ApiProperty({ example: 'PKR' })
  currency: string;

  @ApiProperty({ type: MonthlyTrendDto, isArray: true })
  months: MonthlyTrendDto[];
}

export class AnalyticsTrendsResponseDto {
  @ApiProperty({ type: AnalyticsPeriodDto })
  period: AnalyticsPeriodDto;

  @ApiProperty({ type: CurrencyTrendDto, isArray: true })
  trends: CurrencyTrendDto[];
}
