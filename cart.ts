import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe, LocalizedCurrencyPipe, LocalizedNumberPipe } from '../pipes/locale.pipes';
import { CartItem } from '../models/cart-item';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, LocalizedCurrencyPipe, LocalizedNumberPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {

  cartItems: CartItem[] = [];

  constructor() {
    this.loadCart();
  }

  loadCart(): void {
    const data = localStorage.getItem('ecommerce_cart');

    try {
      this.cartItems = data ? JSON.parse(data) : [];
    } catch {
      this.cartItems = [];
    }
  }

  saveCart(): void {
    localStorage.setItem(
      'ecommerce_cart',
      JSON.stringify(this.cartItems)
    );
  }

  increase(item: CartItem): void {
    if (item.quantity >= item.product.stock) {
      alert(`Only ${item.product.stock} available in stock.`);
      return;
    }
    item.quantity++;
    this.saveCart();
  }

  decrease(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.saveCart();
    } else {
      this.remove(item);
    }
  }

  remove(item: CartItem): void {
    this.cartItems = this.cartItems.filter(
      cartItem => cartItem.product.id !== item.product.id
    );

    this.saveCart();
  }

  clearCart(): void {
    this.cartItems = [];
    localStorage.removeItem('ecommerce_cart');
  }

  get subtotal(): number {
    return this.cartItems.reduce(
      (total, item) =>
        total + item.product.price * item.quantity,
      0
    );
  }

  get delivery(): number {
    return this.subtotal >= 500 ? 0 : 40;
  }

  get total(): number {
    return this.subtotal + this.delivery;
  }

  get itemCount(): number {
    return this.cartItems.reduce(
      (count, item) => count + item.quantity,
      0
    );
  }

  checkout(): void {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    alert(
      `Proceeding to checkout.\n\nTotal Amount: ₹${this.total}`
    );

    // Later we can replace this with the real checkout/order page.
  }
}