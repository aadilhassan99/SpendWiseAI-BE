import { ApiProperty } from '@nestjs/swagger';
import { FinancialAccountType } from '../entities/financial-account.entity';

export class AccountResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ example: 'Main checking' })
  name: string;

  @ApiProperty({
    enum: FinancialAccountType,
    example: FinancialAccountType.Bank,
  })
  type: FinancialAccountType;

  @ApiProperty({ example: 'USD', pattern: '^[A-Z]{3}$' })
  currency: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;
}
