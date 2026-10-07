import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthTokenPayload } from '../common/auth/authenticated-request.interface';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';
import {
  PaginatedTransactionsResponseDto,
  TransactionResponseDto,
} from './dto/transaction-response.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiTags('Transactions')
@ApiCookieAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid session.' })
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  create(
    @CurrentUser() user: AuthTokenPayload,
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.create(user.sub, createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'List transactions with filters and pagination' })
  @ApiOkResponse({ type: PaginatedTransactionsResponseDto })
  findAll(
    @CurrentUser() user: AuthTokenPayload,
    @Query() query: ListTransactionsQueryDto,
  ): Promise<PaginatedTransactionsResponseDto> {
    return this.transactionsService.findAll(user.sub, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiNotFoundResponse({ description: 'Transaction not found.' })
  findOne(
    @CurrentUser() user: AuthTokenPayload,
    @Param('id') transactionId: string,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.findOne(user.sub, transactionId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiNotFoundResponse({ description: 'Transaction not found.' })
  update(
    @CurrentUser() user: AuthTokenPayload,
    @Param('id') transactionId: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.update(
      user.sub,
      transactionId,
      updateTransactionDto,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Transaction deleted.' })
  @ApiNotFoundResponse({ description: 'Transaction not found.' })
  remove(
    @CurrentUser() user: AuthTokenPayload,
    @Param('id') transactionId: string,
  ): Promise<void> {
    return this.transactionsService.remove(user.sub, transactionId);
  }
}
