import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { GarbageType, OrderStatus, OrderType } from '@garbage/shared';
import { InMemoryStore } from '../../store/in-memory.store';
import { AddressesService } from '../addresses/addresses.service';
import { CommunitiesService } from '../communities/communities.service';
import { PackagesService } from '../packages/packages.service';
import { PricingService } from '../pricing/pricing.service';
import type { Address, Order } from '../../store/types';

@Injectable()
export class OrdersService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly communities: CommunitiesService,
    private readonly pricing: PricingService,
    private readonly packages: PackagesService,
    private readonly addresses: AddressesService,
  ) {}

  list(filters: {
    userId?: string;
    tenantId?: string;
    status?: OrderStatus;
    tab?: 'all' | 'ongoing' | 'done';
    page?: number;
    pageSize?: number;
  }) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    let items = [...this.store.orders.values()];
    if (filters.userId) items = items.filter((o) => o.userId === filters.userId);
    if (filters.tenantId) items = items.filter((o) => o.tenantId === filters.tenantId);
    if (filters.status) items = items.filter((o) => o.status === filters.status);
    if (filters.tab === 'ongoing') {
      const ongoing = [
        OrderStatus.PendingPayment,
        OrderStatus.Paid,
        OrderStatus.Assigned,
        OrderStatus.PickedUp,
        OrderStatus.Disposed,
      ];
      items = items.filter((o) => (ongoing as OrderStatus[]).includes(o.status));
    }
    if (filters.tab === 'done') {
      items = items.filter((o) =>
        o.status === OrderStatus.Completed || o.status === OrderStatus.Cancelled,
      );
    }
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = items.length;
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize).map((o) => this.enrichOrder(o)),
      total,
      page,
      pageSize,
    };
  }

  private enrichOrder(order: Order) {
    const addr = this.store.addresses.get(order.addressId);
    const community = this.store.communities.get(order.communityId);
    return {
      ...order,
      addressText: addr
        ? `${community?.name || ''} ${addr.building}${addr.unit !== '-' ? addr.unit + '单元' : ''}${addr.room}`
        : '',
    };
  }

  private requireOrder(id: string): Order {
    const o = this.store.orders.get(id);
    if (!o) throw new NotFoundException('订单不存在');
    return o;
  }

  get(id: string): Order & { addressText?: string } {
    return this.enrichOrder(this.requireOrder(id));
  }

  create(data: {
    userId: string;
    communityId: string;
    addressId?: string;
    address?: Omit<Address, 'id' | 'userId' | 'isDefault' | 'communityName'>;
    garbageType: GarbageType;
    quantity: number;
    usePackage?: boolean;
    scheduledAt?: string;
    remark?: string;
  }) {
    const community = this.communities.get(data.communityId);
    if (!community.enabled) {
      throw new BadRequestException('该小区暂未开通服务');
    }

    let addressId = data.addressId;
    if (addressId) {
      this.addresses.get(addressId, data.userId);
    } else if (data.address) {
      const saved = this.addresses.create(data.userId, {
        ...data.address,
        isDefault: false,
      });
      addressId = saved.id;
    } else {
      throw new BadRequestException('请选择或填写地址');
    }

    const rule = this.pricing.resolvePrice(
      community.tenantId,
      community.id,
      data.garbageType,
    );
    const now = new Date().toISOString();

    let totalAmount = rule.unitPrice * data.quantity;
    let status: OrderStatus = OrderStatus.PendingPayment;
    let payMethod: 'wechat' | 'package' = 'wechat';
    let userPackageId: string | undefined;
    let orderType: OrderType = OrderType.Single;

    if (data.usePackage) {
      const pkg = this.packages.getActivePackage(data.userId);
      if (!pkg) throw new BadRequestException('暂无可用套餐');
      if (pkg.remainingTimes < data.quantity) {
        throw new BadRequestException(`套餐剩余 ${pkg.remainingTimes} 次，不足本次下单`);
      }
      this.packages.deductTimes(pkg.id, data.quantity);
      totalAmount = 0;
      status = OrderStatus.Paid;
      payMethod = 'package';
      userPackageId = pkg.id;
      orderType = OrderType.Package;
    }

    const order: Order = {
      id: uuid(),
      orderNo: this.store.generateOrderNo(),
      userId: data.userId,
      tenantId: community.tenantId,
      communityId: community.id,
      addressId,
      garbageType: data.garbageType,
      quantity: data.quantity,
      unitPrice: rule.unitPrice,
      totalAmount,
      orderType,
      payMethod,
      userPackageId,
      status,
      scheduledAt: data.scheduledAt,
      remark: data.remark,
      createdAt: now,
      updatedAt: now,
    };
    this.store.orders.set(order.id, order);
    return this.enrichOrder(order);
  }

  pay(orderId: string): Order & { addressText?: string } {
    const order = this.requireOrder(orderId);
    if (order.status !== OrderStatus.PendingPayment) {
      throw new BadRequestException('订单状态不允许支付');
    }
    order.status = OrderStatus.Paid;
    order.updatedAt = new Date().toISOString();
    return this.enrichOrder(order);
  }

  assign(orderId: string, riderId: string): Order & { addressText?: string } {
    const order = this.requireOrder(orderId);
    if (order.status !== OrderStatus.Paid) {
      throw new BadRequestException('仅待派单订单可指派');
    }
    const rider = this.store.riders.get(riderId);
    if (!rider || rider.tenantId !== order.tenantId) {
      throw new BadRequestException('骑手无效');
    }
    order.riderId = riderId;
    order.status = OrderStatus.Assigned;
    order.updatedAt = new Date().toISOString();
    return this.enrichOrder(order);
  }

  updateStatus(orderId: string, status: OrderStatus): Order & { addressText?: string } {
    const order = this.requireOrder(orderId);
    const flow: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PendingPayment]: [OrderStatus.Cancelled],
      [OrderStatus.Paid]: [OrderStatus.Assigned, OrderStatus.Cancelled],
      [OrderStatus.Assigned]: [OrderStatus.PickedUp, OrderStatus.Cancelled],
      [OrderStatus.PickedUp]: [OrderStatus.Disposed],
      [OrderStatus.Disposed]: [OrderStatus.Completed],
      [OrderStatus.Completed]: [],
      [OrderStatus.Cancelled]: [],
    };
    if (!flow[order.status]?.includes(status)) {
      throw new BadRequestException(`不能从 ${order.status} 变更为 ${status}`);
    }
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return this.enrichOrder(order);
  }

  review(orderId: string, userId: string, rating: number, content: string): Order & { addressText?: string } {
    const order = this.requireOrder(orderId);
    if (order.userId !== userId) throw new BadRequestException('无权评价');
    if (order.status !== OrderStatus.Completed) {
      throw new BadRequestException('订单完成后才可评价');
    }
    order.rating = rating;
    order.reviewContent = content;
    order.updatedAt = new Date().toISOString();
    return this.enrichOrder(order);
  }
}
