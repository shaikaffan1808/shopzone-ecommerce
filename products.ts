import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, LocalizedCurrencyPipe } from '../pipes/locale.pipes';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { Product } from '../product';
import { WishlistService } from '../services/wishlist.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, TranslatePipe, LocalizedCurrencyPipe],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products {

  private productService = inject(ProductService);
  private wishlistService = inject(WishlistService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  searchText = signal('');
  selectedCategory = signal('All');
  favoritesOnly = signal(false);

  products = this.productService.products;
  favoriteIds = this.wishlistService.productIds;

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe(params => this.favoritesOnly.set(params.get('favorites') === 'true'));
  }

  categories = computed(() => {

    const categories = this.products()
      .map(product => product.category);

    return ['All', ...new Set(categories)];
  });

  filteredProducts = computed(() => {

    const search = this.searchText().toLowerCase().trim();
    const selected = this.selectedCategory();

    return this.products().filter(product => {

      const matchesSearch =
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search);

      const matchesCategory =
        selected === 'All' ||
        product.category === selected;

      const matchesFavorites =
        !this.favoritesOnly() ||
        this.favoriteIds().includes(product.id);

      return matchesSearch && matchesCategory && matchesFavorites;
    });
  });

  toggleFavorite(productId: number): void {
    this.wishlistService.toggle(productId);
  }

  toggleFavoritesFilter(): void {
    const favoritesOnly = !this.favoritesOnly();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { favorites: favoritesOnly ? 'true' : null },
      queryParamsHandling: 'merge'
    });
  }

  addToCart(product: Product): void {
    if (this.cartService.addProduct(product) === 'limit') {
      alert(`Only ${product.stock} of ${product.name} available.`);
      return;
    }
    alert(`${product.name} added to cart!`);
  }
}
