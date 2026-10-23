import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthTokenPayload } from '../common/auth/authenticated-request.interface';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import {
  AnalyticsCategoriesResponseDto,
  AnalyticsSummaryResponseDto,
  AnalyticsTrendsResponseDto,
} from './dto/analytics-response.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiTags('Analytics')
@ApiCookieAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid session.' })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Get income, expenses, and net cash flow by currency',
  })
  @ApiOkResponse({ type: AnalyticsSummaryResponseDto })
  getSummary(
    @CurrentUser() user: AuthTokenPayload,
    @Query() query: AnalyticsQueryDto,
  ): Promise<AnalyticsSummaryResponseDto> {
    return this.analyticsService.getSummary(user.sub, query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get expense totals by category and currency' })
  @ApiOkResponse({ type: AnalyticsCategoriesResponseDto })
  getCategories(
    @CurrentUser() user: AuthTokenPayload,
    @Query() query: AnalyticsQueryDto,
  ): Promise<AnalyticsCategoriesResponseDto> {
    return this.analyticsService.getCategories(user.sub, query);
  }

  @Get('trends')
  @ApiOperation({
    summary: 'Get monthly income and expense totals by currency',
  })
  @ApiOkResponse({ type: AnalyticsTrendsResponseDto })
  getTrends(
    @CurrentUser() user: AuthTokenPayload,
    @Query() query: AnalyticsQueryDto,
  ): Promise<AnalyticsTrendsResponseDto> {
    return this.analyticsService.getTrends(user.sub, query);
  }
}
