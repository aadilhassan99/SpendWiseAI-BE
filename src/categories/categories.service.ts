import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAll(userId: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: [{ userId }, { userId: IsNull() }],
      order: { name: 'ASC' },
    });
  }

  create(
    userId: string,
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesRepository.save(
      this.categoriesRepository.create({ ...createCategoryDto, userId }),
    );
  }

  async getAccessibleCategory(
    userId: string,
    categoryId: string,
  ): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({
      id: categoryId,
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (category.userId !== null && category.userId !== userId) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  assertCategoryTypeMatches(category: Category, transactionType: string): void {
    if (String(category.type) !== transactionType) {
      throw new BadRequestException(
        'Category type must match the transaction type',
      );
    }
  }

  async update(
    userId: string,
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({
      id: categoryId,
      userId,
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    Object.assign(category, this.withDefinedValues(updateCategoryDto));
    return this.categoriesRepository.save(category);
  }

  private withDefinedValues(
    updateCategoryDto: UpdateCategoryDto,
  ): Partial<Category> {
    return Object.fromEntries(
      Object.entries(updateCategoryDto).filter(
        ([, value]) => value !== undefined,
      ),
    );
  }
}
