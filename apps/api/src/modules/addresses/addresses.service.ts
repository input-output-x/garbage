import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { InMemoryStore } from '../../store/in-memory.store';
import type { Address } from '../../store/types';

@Injectable()
export class AddressesService {
  constructor(private readonly store: InMemoryStore) {}

  list(userId: string): Address[] {
    return [...this.store.addresses.values()]
      .filter((a) => a.userId === userId)
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  }

  get(id: string, userId: string): Address {
    const addr = this.store.addresses.get(id);
    if (!addr || addr.userId !== userId) {
      throw new NotFoundException('地址不存在');
    }
    return addr;
  }

  create(userId: string, data: Omit<Address, 'id' | 'userId'>): Address {
    if (data.isDefault) {
      this.clearDefault(userId);
    }
    const community = this.store.communities.get(data.communityId);
    const addr: Address = {
      id: uuid(),
      userId,
      ...data,
      communityName: community?.name,
    };
    this.store.addresses.set(addr.id, addr);
    if (![...this.store.addresses.values()].some((a) => a.userId === userId && a.isDefault)) {
      addr.isDefault = true;
    }
    return addr;
  }

  update(id: string, userId: string, data: Partial<Omit<Address, 'id' | 'userId'>>): Address {
    const addr = this.get(id, userId);
    if (data.isDefault) this.clearDefault(userId);
    Object.assign(addr, data);
    if (data.communityId) {
      const c = this.store.communities.get(data.communityId);
      addr.communityName = c?.name;
    }
    return addr;
  }

  remove(id: string, userId: string): void {
    const addr = this.get(id, userId);
    this.store.addresses.delete(id);
    if (addr.isDefault) {
      const rest = this.list(userId);
      if (rest[0]) rest[0].isDefault = true;
    }
  }

  setDefault(id: string, userId: string): Address {
    this.clearDefault(userId);
    const addr = this.get(id, userId);
    addr.isDefault = true;
    return addr;
  }

  private clearDefault(userId: string) {
    for (const a of this.store.addresses.values()) {
      if (a.userId === userId) a.isDefault = false;
    }
  }
}
