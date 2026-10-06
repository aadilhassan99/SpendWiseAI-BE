import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FinancialAccountType } from '../entities/financial-account.entity';

export class UpdateAccountDto {
  @ApiPropertyOptional({ example: 'Main checking' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({
    enum: FinancialAccountType,
    example: FinancialAccountType.Bank,
  })
  @IsOptional()
  @IsEnum(FinancialAccountType)
  type?: FinancialAccountType;

  @ApiPropertyOptional({ example: 'USD', pattern: '^[A-Z]{3}$' })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value?.toUpperCase())
  @Matches(/^[A-Z]{3}$/)
  currency?: string;
}
