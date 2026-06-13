import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header = req.headers.authorization as string | undefined;
    const token = header?.replace(/^Bearer\s+/i, '');
    if (!token) {
      throw new UnauthorizedException('未登录');
    }
    const payload = this.auth.resolveToken(token);
    if (!payload) {
      throw new UnauthorizedException('登录已失效');
    }
    req.user = payload;
    return true;
  }
}
