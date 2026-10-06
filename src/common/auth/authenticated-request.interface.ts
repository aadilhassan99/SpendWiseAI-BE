import { Request } from 'express';

export interface AuthTokenPayload {
  sub: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthTokenPayload;
}
