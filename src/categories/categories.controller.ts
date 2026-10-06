import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/auth/current-user.decorator';
import type { AuthTokenPayload } from '../common/auth/authenticated-request.interface';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiTags('Categories')
@ApiCookieAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid session.' })
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List categories available to the current user' })
  @ApiOkResponse({ type: CategoryResponseDto, isArray: true })
  findAll(@CurrentUser() user: AuthTokenPayload) {
    return this.categoriesService.findAll(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a personal category' })
  @ApiCreatedResponse({ type: CategoryResponseDto })
  create(
    @CurrentUser() user: AuthTokenPayload,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(user.sub, createCategoryDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a personal category' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: CategoryResponseDto })
  @ApiNotFoundResponse({ description: 'Category not found.' })
  update(
    @CurrentUser() user: AuthTokenPayload,
    @Param('id') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(
      user.sub,
      categoryId,
      updateCategoryDto,
    );
  }
}
