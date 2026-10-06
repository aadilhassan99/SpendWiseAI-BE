import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import {
  AuthTokenPayload,
  AuthenticatedRequest,
} from './authenticated-request.interface';

export const AUTH_COOKIE_NAME = 'spendwise_session';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      request.user = await this.jwtService.verifyAsync<AuthTokenPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractToken(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (authorization?.startsWith('Bearer ')) {
      return authorization.slice('Bearer '.length);
    }

    const cookie = request.headers.cookie;
    if (!cookie) {
      return undefined;
    }

    return cookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`))
      ?.slice(`${AUTH_COOKIE_NAME}=`.length);
  }
}
