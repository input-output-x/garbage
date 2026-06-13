import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { InMemoryStore } from '../../store/in-memory.store';
import type { Rider } from '../../store/types';

@Injectable()
export class RidersService {
  constructor(private readonly store: InMemoryStore) {}

  list(tenantId: string): Rider[] {
    return [...this.store.riders.values()].filter((r) => r.tenantId === tenantId);
  }

  get(id: string): Rider {
    const r = this.store.riders.get(id);
    if (!r) throw new NotFoundException('骑手不存在');
    return r;
  }

  create(data: { tenantId: string; name: string; phone: string }): Rider {
    const rider: Rider = {
      id: uuid(),
      tenantId: data.tenantId,
      name: data.name,
      phone: data.phone,
      active: true,
    };
    this.store.riders.set(rider.id, rider);
    return rider;
  }
}
