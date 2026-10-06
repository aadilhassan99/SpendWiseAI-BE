import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '../entities/category.entity';

export class CategoryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid', nullable: true })
  userId: string | null;

  @ApiProperty({ example: 'Groceries' })
  name: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.Expense })
  type: CategoryType;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;
}
