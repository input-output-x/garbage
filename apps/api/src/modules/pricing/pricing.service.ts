import { Injectable, NotFoundException } from '@nestjs/common';
import { GarbageType } from '@garbage/shared';
import { InMemoryStore } from '../../store/in-memory.store';
import type { PriceRule } from '../../store/types';

@Injectable()
export class PricingService {
  constructor(private readonly store: InMemoryStore) {}

  list(tenantId: string, communityId?: string): PriceRule[] {
    return [...this.store.priceRules.values()].filter((r) => {
      if (communityId && r.communityId === communityId) return true;
      if (!r.communityId && r.tenantId === tenantId) return true;
      return false;
    });
  }

  resolvePrice(
    tenantId: string,
    communityId: string,
    garbageType: GarbageType,
  ): PriceRule {
    const communityRule = [...this.store.priceRules.values()].find(
      (r) => r.communityId === communityId && r.garbageType === garbageType,
    );
    if (communityRule) return communityRule;

    const tenantRule = [...this.store.priceRules.values()].find(
      (r) => r.tenantId === tenantId && !r.communityId && r.garbageType === garbageType,
    );
    if (tenantRule) return tenantRule;

    throw new NotFoundException(`未配置 ${garbageType} 价格`);
  }
}
