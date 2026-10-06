import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  AuthTokenPayload,
  AuthenticatedRequest,
} from './authenticated-request.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthTokenPayload => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
