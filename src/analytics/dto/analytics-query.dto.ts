import { Transform } from 'class-transformer';
import { IsDateString, IsOptional, IsUUID, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ format: 'date', example: '2026-07-01' })
  @IsOptional()
  @IsDateString({ strict: true })
  from?: string;

  @ApiPropertyOptional({ format: 'date', example: '2026-07-31' })
  @IsOptional()
  @IsDateString({ strict: true })
  to?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiPropertyOptional({ example: 'PKR', pattern: '^[A-Z]{3}$' })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.toUpperCase())
  @Matches(/^[A-Z]{3}$/)
  currency?: string;
}
