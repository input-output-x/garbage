import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { TenantStatus } from '@garbage/shared';
import { InMemoryStore } from '../../store/in-memory.store';
import type { Tenant } from '../../store/types';

@Injectable()
export class TenantsService {
  constructor(private readonly store: InMemoryStore) {}

  list(): Tenant[] {
    return [...this.store.tenants.values()].sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt),
    );
  }

  get(id: string): Tenant {
    const t = this.store.tenants.get(id);
    if (!t) throw new NotFoundException('租户不存在');
    return t;
  }

  create(data: {
    name: string;
    contactPhone: string;
    city: string;
    commissionRate?: number;
  }): Tenant {
    const tenant: Tenant = {
      id: uuid(),
      name: data.name,
      contactPhone: data.contactPhone,
      city: data.city,
      status: TenantStatus.Trial,
      commissionRate: data.commissionRate ?? 0.05,
      createdAt: new Date().toISOString(),
    };
    this.store.tenants.set(tenant.id, tenant);
    return tenant;
  }

  updateStatus(id: string, status: TenantStatus): Tenant {
    const t = this.get(id);
    t.status = status;
    return t;
  }
}
