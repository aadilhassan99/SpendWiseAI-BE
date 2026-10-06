import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { AUTH_COOKIE_NAME, JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import type { AuthTokenPayload } from '../common/auth/authenticated-request.interface';
import { AuthService } from './auth.service';
import { AuthResponseDto, AuthenticatedUserDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a user and start a session' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid registration details.' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(registerDto);
    response.cookie(
      AUTH_COOKIE_NAME,
      result.accessToken,
      this.authService.getSessionCookieOptions(),
    );
    return { user: result.user };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Authenticate a user and start a session' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);
    response.cookie(
      AUTH_COOKIE_NAME,
      result.accessToken,
      this.authService.getSessionCookieOptions(),
    );
    return { user: result.user };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the current authenticated user' })
  @ApiCookieAuth()
  @ApiOkResponse({ type: AuthenticatedUserDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid session.' })
  getMe(@CurrentUser() user: AuthTokenPayload) {
    return this.authService.getCurrentUser(user.sub);
  }
}
