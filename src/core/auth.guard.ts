import { CanActivate, ExecutionContext } from '@nestjs/common';
import { IAuthenticator } from '../users/services/authenticator';
import { extractToken } from './utils/extract-token';

export class AuthGuard implements CanActivate {
  constructor(private readonly authenticator: IAuthenticator) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header = request.headers.authorization;

    if (!header) {
      return false;
    }

    const token = extractToken(header);
    if (!token) {
      return false;
    }

    try {
      request.user = await this.authenticator.authenticate(token);
      return true;
    } catch (e) {
      return false;
    }
  }
}
