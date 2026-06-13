import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { InMemoryStore } from '../../store/in-memory.store';
import type { Community } from '../../store/types';

@Injectable()
export class CommunitiesService {
  constructor(private readonly store: InMemoryStore) {}

  listByTenant(tenantId?: string): Community[] {
    return [...this.store.communities.values()]
      .filter((c) => !tenantId || c.tenantId === tenantId)
      .filter((c) => c.enabled);
  }

  listAll(tenantId?: string): Community[] {
    return [...this.store.communities.values()].filter(
      (c) => !tenantId || c.tenantId === tenantId,
    );
  }

  get(id: string): Community {
    const c = this.store.communities.get(id);
    if (!c) throw new NotFoundException('小区不存在');
    return c;
  }

  create(data: {
    tenantId: string;
    name: string;
    address: string;
    enabled?: boolean;
  }): Community {
    const community: Community = {
      id: uuid(),
      tenantId: data.tenantId,
      name: data.name,
      address: data.address,
      enabled: data.enabled ?? true,
    };
    this.store.communities.set(community.id, community);
    return community;
  }
}
