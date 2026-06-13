import {
  GarbageType,
  OrderStatus,
  OrderType,
  PackagePeriod,
  TenantStatus,
} from '@garbage/shared';

export interface Tenant {
  id: string;
  name: string;
  contactPhone: string;
  city: string;
  status: TenantStatus;
  commissionRate: number;
  createdAt: string;
}

export interface Community {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  enabled: boolean;
  lat?: number;
  lng?: number;
}

export interface Rider {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  active: boolean;
}

export interface WxUser {
  id: string;
  openId: string;
  nickname?: string;
  phone?: string;
  avatarUrl?: string;
  memberId?: string;
  createdAt?: string;
}

export interface Address {
  id: string;
  userId: string;
  communityId: string;
  communityName?: string;
  building: string;
  unit: string;
  room: string;
  contactName: string;
  contactPhone: string;
  isDefault: boolean;
}

export interface PriceRule {
  id: string;
  tenantId?: string;
  communityId?: string;
  garbageType: GarbageType;
  unitPrice: number;
  unitLabel: string;
  maxWeightKg?: number;
}

export interface PackagePlan {
  id: string;
  tenantId: string;
  name: string;
  period: PackagePeriod;
  price: number;
  totalTimes: number;
  description: string;
  tag?: string;
}

export interface UserPackage {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  remainingTimes: number;
  totalTimes: number;
  expireAt: string;
  status: 'active' | 'expired';
  createdAt: string;
}

export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  tenantId: string;
  communityId: string;
  addressId: string;
  riderId?: string;
  garbageType: GarbageType;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  orderType: OrderType;
  payMethod: 'wechat' | 'package';
  userPackageId?: string;
  status: OrderStatus;
  scheduledAt?: string;
  remark?: string;
  rating?: number;
  reviewContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  nickname: string;
  orderType: OrderType;
  planName?: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  role: 'platform_admin' | 'tenant_admin' | 'tenant_operator';
  tenantId?: string;
}

/** 固定演示 ID，重启服务后小区/套餐 ID 不变 */
export const DEMO_TENANT_ID = 'tenant-demo-001';
export const DEMO_COMMUNITY_ID = 'community-demo-001';
