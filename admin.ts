import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../product';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { FooterService, DEFAULT_FOOTER } from '../services/footer.service';
import { FooterContent } from '../models/footer';
import { User, UserRole } from '../models/user';
import { TranslatePipe, LocalizedCurrencyPipe, LocalizedNumberPipe } from '../pipes/locale.pipes';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, LocalizedCurrencyPipe, LocalizedNumberPipe],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {

  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private footerService = inject(FooterService);

  products = this.productService.products;

  // ----- users -----
  users = this.authService.users;
  currentUser = this.authService.currentUser;

  newUser: { name: string; email: string; password: string; role: UserRole } = {
    name: '',
    email: '',
    password: '',
    role: 'user'
  };

  userMessage = '';
  userMessageIsError = false;

  // ----- footer -----
  footerForm: FooterContent = { ...this.footerService.footer() };

  footerMessage = '';

  editingProductId: number | null = null;

  product: Omit<Product, 'id'> = {
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    rating: 4,
    stock: 1
  };

  addProduct(): void {

    if (
      !this.product.name.trim() ||
      !this.product.category.trim() ||
      this.product.price <= 0 ||
      this.product.stock < 0 ||
      this.product.rating < 0 ||
      this.product.rating > 5
    ) {
      alert('Please enter product name, category, a valid price, stock (0 or more) and rating (0-5).');
      return;
    }

    this.productService.addProduct({
      name: this.product.name,
      description: this.product.description,
      price: this.product.price,
      category: this.product.category,
      image: this.product.image,
      rating: this.product.rating,
      stock: this.product.stock
    });

    alert('Product added successfully.');

    this.resetForm();
  }

  editProduct(product: Product): void {

    this.editingProductId = product.id;

    this.product = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      rating: product.rating,
      stock: product.stock
    };

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  updateProduct(): void {

    if (this.editingProductId === null) {
      return;
    }

    if (
      !this.product.name.trim() ||
      !this.product.category.trim() ||
      this.product.price <= 0 ||
      this.product.stock < 0 ||
      this.product.rating < 0 ||
      this.product.rating > 5
    ) {
      alert('Please enter product name, category, a valid price, stock (0 or more) and rating (0-5).');
      return;
    }

    const updatedProduct: Product = {
      id: this.editingProductId,
      ...this.product
    };

    this.productService.updateProduct(updatedProduct);

    alert('Product updated successfully.');

    this.resetForm();
  }

  deleteProduct(id: number): void {

    const confirmed = confirm(
      'Are you sure you want to delete this product?'
    );

    if (!confirmed) {
      return;
    }

    this.productService.deleteProduct(id);

    alert('Product deleted successfully.');
  }

  resetForm(): void {

    this.editingProductId = null;

    this.product = {
      name: '',
      description: '',
      price: 0,
      category: '',
      image: '',
      rating: 4,
      stock: 1
    };
  }

  // ---------------- USERS ----------------

  addUser(): void {

    const result = this.authService.addUser(
      this.newUser.name,
      this.newUser.email,
      this.newUser.password,
      this.newUser.role
    );

    this.userMessage = result.message;
    this.userMessageIsError = !result.success;

    if (result.success) {
      this.newUser = { name: '', email: '', password: '', role: 'user' };
    }
  }

  deleteUser(user: User): void {

    if (!confirm(`Delete user ${user.email}?`)) {
      return;
    }

    const result = this.authService.deleteUser(user.id);

    this.userMessage = result.message;
    this.userMessageIsError = !result.success;
  }

  canDelete(user: User): boolean {

    return user.email.toLowerCase() !== 'admin@ecommerce.com' &&
      user.id !== this.currentUser()?.id;
  }

  // ---------------- FOOTER ----------------

  saveFooter(): void {

    this.footerService.update(this.footerForm);

    this.footerForm = { ...this.footerService.footer() };

    this.footerMessage = 'Footer updated. It is now live on every page.';
  }

  resetFooter(): void {

    if (!confirm('Restore the default footer text?')) {
      return;
    }

    this.footerService.reset();

    this.footerForm = { ...DEFAULT_FOOTER };

    this.footerMessage = 'Footer restored to defaults.';
  }
}
