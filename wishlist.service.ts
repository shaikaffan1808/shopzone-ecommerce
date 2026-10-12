import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly storageKey = 'ecommerce_wishlist';
  private readonly productIdsSignal = signal<number[]>(this.loadProductIds());
  readonly productIds = this.productIdsSignal.asReadonly();

  toggle(productId: number): void {
    const productIds = this.productIdsSignal();
    const updatedIds = productIds.includes(productId)
      ? productIds.filter(id => id !== productId)
      : [...productIds, productId];

    localStorage.setItem(this.storageKey, JSON.stringify(updatedIds));
    this.productIdsSignal.set(updatedIds);
  }

  has(productId: number): boolean {
    return this.productIdsSignal().includes(productId);
  }

  private loadProductIds(): number[] {
    const storedIds = localStorage.getItem(this.storageKey);
    if (!storedIds) {
      return [];
    }

    try {
      const parsedIds: unknown = JSON.parse(storedIds);
      return Array.isArray(parsedIds)
        ? parsedIds.filter((id): id is number => Number.isSafeInteger(id) && id > 0)
        : [];
    } catch {
      return [];
    }
  }
}
