import { Injectable, UnauthorizedException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { InMemoryStore } from '../../store/in-memory.store';

export interface TokenPayload {
  sub: string;
  type: 'wx' | 'admin';
  role?: string;
  tenantId?: string;
}

@Injectable()
export class AuthService {
  private tokens = new Map<string, TokenPayload>();

  constructor(private readonly store: InMemoryStore) {}

  /** 开发环境：模拟微信登录 */
  wxLogin(code: string) {
    const openId = `mock_${code || 'guest'}`;
    let user = [...this.store.users.values()].find((u) => u.openId === openId);
    if (!user) {
      user = {
        id: uuid(),
        openId,
        nickname: '微信用户',
        memberId: this.store.generateMemberId(),
        createdAt: new Date().toISOString(),
      };
      this.store.users.set(user.id, user);
    }
    const token = uuid();
    this.tokens.set(token, { sub: user.id, type: 'wx' });
    return { token, user };
  }

  adminLogin(username: string, password: string) {
    const admin = [...this.store.adminUsers.values()].find(
      (a) => a.username === username && a.password === password,
    );
    if (!admin) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const token = uuid();
    this.tokens.set(token, {
      sub: admin.id,
      type: 'admin',
      role: admin.role,
      tenantId: admin.tenantId,
    });
    return {
      token,
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        tenantId: admin.tenantId,
      },
    };
  }

  resolveToken(token: string): TokenPayload | null {
    return this.tokens.get(token) ?? null;
  }
}
