import { Injectable, OnModuleInit } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import {
  GarbageType,
  OrderStatus,
  OrderType,
  PackagePeriod,
  TenantStatus,
} from '@garbage/shared';
import type {
  Address,
  AdminUser,
  Community,
  Order,
  PackagePlan,
  PriceRule,
  Review,
  Rider,
  Tenant,
  UserPackage,
  WxUser,
} from './types';
import { DEMO_COMMUNITY_ID, DEMO_TENANT_ID } from './types';

@Injectable()
export class InMemoryStore implements OnModuleInit {
  tenants = new Map<string, Tenant>();
  communities = new Map<string, Community>();
  riders = new Map<string, Rider>();
  users = new Map<string, WxUser>();
  addresses = new Map<string, Address>();
  priceRules = new Map<string, PriceRule>();
  packagePlans = new Map<string, PackagePlan>();
  userPackages = new Map<string, UserPackage>();
  orders = new Map<string, Order>();
  reviews = new Map<string, Review>();
  adminUsers = new Map<string, AdminUser>();

  onModuleInit() {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();

    this.tenants.set(DEMO_TENANT_ID, {
      id: DEMO_TENANT_ID,
      name: '示例运营商（广州黄埔）',
      contactPhone: '13800138000',
      city: '广州市',
      status: TenantStatus.Active,
      commissionRate: 0.05,
      createdAt: now,
    });

    this.communities.set(DEMO_COMMUNITY_ID, {
      id: DEMO_COMMUNITY_ID,
      tenantId: DEMO_TENANT_ID,
      name: '保利学府',
      address: '广州市黄埔区科学大道',
      enabled: true,
      lat: 23.17,
      lng: 113.45,
    });

    this.riders.set('rider-demo-001', {
      id: 'rider-demo-001',
      tenantId: DEMO_TENANT_ID,
      name: '张师傅',
      phone: '13900139000',
      active: true,
    });

    for (const [type, price] of [
      [GarbageType.Kitchen, 3],
      [GarbageType.Other, 3],
      [GarbageType.Bulky, 30],
    ] as const) {
      this.priceRules.set(`price-${type}`, {
        id: `price-${type}`,
        tenantId: DEMO_TENANT_ID,
        garbageType: type,
        unitPrice: price,
        unitLabel: type === GarbageType.Bulky ? '件' : '袋',
        maxWeightKg: type === GarbageType.Bulky ? undefined : 3,
      });
    }

    const plans: PackagePlan[] = [
      {
        id: 'plan-month',
        tenantId: DEMO_TENANT_ID,
        name: '月卡',
        period: PackagePeriod.Month,
        price: 58,
        totalTimes: 30,
        description: '30次代扔，30天有效',
        tag: '热销',
      },
      {
        id: 'plan-quarter',
        tenantId: DEMO_TENANT_ID,
        name: '季卡',
        period: PackagePeriod.Quarter,
        price: 158,
        totalTimes: 100,
        description: '100次代扔，90天有效',
      },
      {
        id: 'plan-year',
        tenantId: DEMO_TENANT_ID,
        name: '年卡',
        period: PackagePeriod.Year,
        price: 498,
        totalTimes: 500,
        description: '500次代扔，365天有效',
        tag: '最划算',
      },
    ];
    for (const p of plans) this.packagePlans.set(p.id, p);

    const reviewSamples: Review[] = [
      {
        id: 'review-1',
        userId: 'demo',
        nickname: 'snobe',
        orderType: OrderType.Single,
        rating: 5,
        content: '非常满意',
        createdAt: '2026-06-11T10:00:00.000Z',
      },
      {
        id: 'review-2',
        userId: 'demo',
        nickname: '李女士',
        orderType: OrderType.Package,
        planName: '月卡',
        rating: 5,
        content: '很方便，师傅准时',
        createdAt: '2026-06-10T08:00:00.000Z',
      },
      {
        id: 'review-3',
        userId: 'demo',
        nickname: '王先生',
        orderType: OrderType.Single,
        rating: 5,
        content: '加班族的救星',
        createdAt: '2026-06-09T14:00:00.000Z',
      },
    ];
    for (const r of reviewSamples) this.reviews.set(r.id, r);

    this.adminUsers.set('admin-demo', {
      id: 'admin-demo',
      username: 'admin',
      password: 'admin123',
      role: 'platform_admin',
    });

    this.adminUsers.set('tenant-admin-demo', {
      id: 'tenant-admin-demo',
      username: 'tenant',
      password: 'tenant123',
      role: 'tenant_admin',
      tenantId: DEMO_TENANT_ID,
    });
  }

  generateOrderNo(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const rand = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `GB${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${rand}`;
  }

  generateMemberId(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }
}
