/** 垃圾类型 */
export const GarbageType = {
  Kitchen: 'kitchen',
  Other: 'other',
  Bulky: 'bulky',
  Recyclable: 'recyclable',
} as const;
export type GarbageType = (typeof GarbageType)[keyof typeof GarbageType];

export const GARBAGE_TYPE_LABELS: Record<GarbageType, string> = {
  kitchen: '餐厨垃圾',
  other: '其他垃圾',
  bulky: '大件垃圾',
  recyclable: '可回收物',
};

/** 订单状态 */
export const OrderStatus = {
  PendingPayment: 'pending_payment',
  Paid: 'paid',
  Assigned: 'assigned',
  PickedUp: 'picked_up',
  Disposed: 'disposed',
  Completed: 'completed',
  Cancelled: 'cancelled',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: '待支付',
  paid: '待派单',
  assigned: '已派单',
  picked_up: '已取袋',
  disposed: '已投放',
  completed: '已完成',
  cancelled: '已取消',
};

/** 租户状态 */
export const TenantStatus = {
  Active: 'active',
  Suspended: 'suspended',
  Trial: 'trial',
} as const;
export type TenantStatus = (typeof TenantStatus)[keyof typeof TenantStatus];

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** 套餐周期 */
export const PackagePeriod = {
  Month: 'month',
  Quarter: 'quarter',
  Year: 'year',
} as const;
export type PackagePeriod = (typeof PackagePeriod)[keyof typeof PackagePeriod];

export const PACKAGE_PERIOD_LABELS: Record<PackagePeriod, string> = {
  month: '包月',
  quarter: '包季',
  year: '包年',
};

/** 订单类型 */
export const OrderType = {
  Single: 'single',
  Package: 'package',
} as const;
export type OrderType = (typeof OrderType)[keyof typeof OrderType];
