import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { InMemoryStore } from '../../store/in-memory.store';
import type { PackagePlan, UserPackage } from '../../store/types';
import { DEMO_TENANT_ID } from '../../store/types';

@Injectable()
export class PackagesService {
  constructor(private readonly store: InMemoryStore) {}

  listPlans(tenantId = DEMO_TENANT_ID): PackagePlan[] {
    return [...this.store.packagePlans.values()].filter(
      (p) => p.tenantId === tenantId,
    );
  }

  getPlan(id: string): PackagePlan {
    const plan = this.store.packagePlans.get(id);
    if (!plan) throw new NotFoundException('套餐不存在');
    return plan;
  }

  getActivePackage(userId: string): UserPackage | null {
    const now = Date.now();
    const pkgs = [...this.store.userPackages.values()]
      .filter((p) => p.userId === userId && p.status === 'active')
      .filter((p) => new Date(p.expireAt).getTime() > now && p.remainingTimes > 0)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return pkgs[0] ?? null;
  }

  listUserPackages(userId: string): UserPackage[] {
    return [...this.store.userPackages.values()]
      .filter((p) => p.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  purchase(userId: string, planId: string): UserPackage {
    const plan = this.getPlan(planId);
    const daysMap = { month: 30, quarter: 90, year: 365 };
    const days = daysMap[plan.period];
    const expireAt = new Date(Date.now() + days * 86400000).toISOString();

    const pkg: UserPackage = {
      id: uuid(),
      userId,
      planId: plan.id,
      planName: plan.name,
      remainingTimes: plan.totalTimes,
      totalTimes: plan.totalTimes,
      expireAt,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    this.store.userPackages.set(pkg.id, pkg);
    return pkg;
  }

  deductTimes(userPackageId: string, quantity: number): UserPackage {
    const pkg = this.store.userPackages.get(userPackageId);
    if (!pkg || pkg.status !== 'active') {
      throw new NotFoundException('套餐无效');
    }
    if (pkg.remainingTimes < quantity) {
      throw new NotFoundException('套餐次数不足');
    }
    pkg.remainingTimes -= quantity;
    if (pkg.remainingTimes <= 0 || new Date(pkg.expireAt).getTime() <= Date.now()) {
      pkg.status = 'expired';
    }
    return pkg;
  }
}
