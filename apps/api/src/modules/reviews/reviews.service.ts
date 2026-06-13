import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { OrderType } from '@garbage/shared';
import { InMemoryStore } from '../../store/in-memory.store';
import type { Review } from '../../store/types';

@Injectable()
export class ReviewsService {
  constructor(private readonly store: InMemoryStore) {}

  list(limit = 10): { items: Review[]; total: number } {
    const items = [...this.store.reviews.values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
    return { items, total: this.store.reviews.size };
  }

  create(data: {
    userId: string;
    nickname: string;
    orderType: OrderType;
    planName?: string;
    rating: number;
    content: string;
  }): Review {
    const review: Review = {
      id: uuid(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.store.reviews.set(review.id, review);
    return review;
  }
}
