import { IsEnum, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '../entities/category.entity';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Groceries' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.Expense })
  @IsEnum(CategoryType)
  type: CategoryType;
}
