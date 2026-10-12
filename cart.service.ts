import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item';
import { Product } from '../product';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly storageKey = 'ecommerce_cart';

  addProduct(product: Product): 'added' | 'limit' {
    if (product.stock <= 0) {
      return 'limit';
    }

    let cart: CartItem[] = [];

    try {
      cart = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch {
      cart = [];
    }

    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        return 'limit';
      }
      existing.quantity++;
    } else {
      cart.push({ product, quantity: 1 });
    }

    localStorage.setItem(this.storageKey, JSON.stringify(cart));
    return 'added';
  }
}
