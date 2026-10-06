import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiTags('Accounts')
@ApiCookieAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid session.' })
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: "List the current user's financial accounts" })
  @ApiOkResponse({ type: AccountResponseDto, isArray: true })
  findAll(@CurrentUser() user: AuthTokenPayload) {
    return this.accountsService.findAll(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a financial account' })
  @ApiCreatedResponse({ type: AccountResponseDto })
  create(
    @CurrentUser() user: AuthTokenPayload,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.accountsService.create(user.sub, createAccountDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a financial account' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: AccountResponseDto })
  @ApiNotFoundResponse({ description: 'Account not found.' })
  update(
    @CurrentUser() user: AuthTokenPayload,
    @Param('id') accountId: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(user.sub, accountId, updateAccountDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a financial account' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Account deleted.' })
  @ApiNotFoundResponse({ description: 'Account not found.' })
  remove(
    @CurrentUser() user: AuthTokenPayload,
    @Param('id') accountId: string,
  ): Promise<void> {
    return this.accountsService.remove(user.sub, accountId);
  }
}
