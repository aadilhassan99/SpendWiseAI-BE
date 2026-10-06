import { Transform } from 'class-transformer';
import { IsEnum, IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FinancialAccountType } from '../entities/financial-account.entity';

export class CreateAccountDto {
  @ApiProperty({ example: 'Main checking' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({
    enum: FinancialAccountType,
    example: FinancialAccountType.Bank,
  })
  @IsEnum(FinancialAccountType)
  type: FinancialAccountType;

  @ApiProperty({ example: 'USD', pattern: '^[A-Z]{3}$' })
  @Transform(({ value }: { value: string }) => value?.toUpperCase())
  @Matches(/^[A-Z]{3}$/)
  currency: string;
}
