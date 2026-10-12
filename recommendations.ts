import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Product } from '../product';
import { LocalizedCurrencyPipe, TranslatePipe } from '../pipes/locale.pipes';
import { ProductService } from '../services/product.service';
import { WishlistService } from '../services/wishlist.service';
import { CartService } from '../services/cart.service';
import { AnalysisProfile, ProductAnalysisDialog } from './product-analysis-dialog';
import {
  Budget,
  fitsBudget,
  getRecommendationInterest,
  matchesInterest,
  selectRecommendationCandidates,
  ShoppingInterest,
  SkinGoal,
  SkinType
} from './recommendation-matcher';

interface SavedQuiz {
  interest: ShoppingInterest;
  skinType: SkinType;
  skinGoal: SkinGoal;
  budget: Budget;
}

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [FormsModule, RouterLink, LocalizedCurrencyPipe, TranslatePipe, ProductAnalysisDialog],
  templateUrl: './recommendations.html',
  styleUrls: ['./recommendations.css', './recommendation-card-actions.css']
})
export class Recommendations {
  private readonly productService = inject(ProductService);
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  private readonly quizStorageKey = 'ecommerce_product_quiz_v1';
  private readonly premiumStorageKey = 'ecommerce_premium_preview_v1';

  readonly products = this.productService.products;
  readonly favoriteIds = this.wishlistService.productIds;
  readonly interests: { value: ShoppingInterest; label: string }[] = [
    { value: 'all', label: 'Everything' },
    { value: 'skincare', label: 'Skincare' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion' }
  ];

  interest: ShoppingInterest = 'all';
  skinType: SkinType = 'none';
  skinGoal: SkinGoal = 'any';
  budget: Budget = 'any';
  quizComplete = signal(false);
  private readonly quizRevision = signal(0);
  premiumEmail = localStorage.getItem('ecommerce_newsletter_email') ?? '';
  premiumJoined = signal(localStorage.getItem(this.premiumStorageKey) === 'true');
  premiumMessage = signal('');
  selectedProduct = signal<Product | null>(null);
  readonly addedProductIds = signal<number[]>([]);

  analysisProfile = computed<AnalysisProfile>(() => ({
    interest: this.interest,
    skinType: this.skinType,
    budget: this.budget
  }));

  recommendations = computed(() => {
    this.quizRevision();
    const available = this.products().filter(product => product.stock > 0);
    if (!this.quizComplete()) {
      return available
        .sort((first, second) =>
          second.rating - first.rating ||
          first.price - second.price
        )
        .slice(0, 4);
    }

    return this.recommendationCandidates()
      .map(product => ({ product, score: this.scoreProduct(product) }))
      .sort((first, second) =>
        second.score - first.score ||
        second.product.rating - first.product.rating ||
        first.product.price - second.product.price
      )
      .slice(0, 4)
      .map(result => result.product);
  });

  recommendationStatus = computed(() => {
    this.quizRevision();
    if (!this.quizComplete()) {
      return 'recommendations.popularStatus';
    }

    const available = this.products().filter(product => product.stock > 0);
    if (available.length === 0) {
      return 'recommendations.noStock';
    }

    const selectedInterest = this.selectedInterest();
    const categoryMatches = selectedInterest === 'all'
      ? available
      : available.filter(product => matchesInterest(product, selectedInterest));
    if (categoryMatches.length === 0) {
      return 'recommendations.noInterestMatch';
    }

    if (this.budget !== 'any' && !categoryMatches.some(product => fitsBudget(product.price, this.budget))) {
      return selectedInterest === 'all'
        ? 'recommendations.noBudgetMatch'
        : 'recommendations.noCombinedMatch';
    }

    return 'recommendations.filtersMatched';
  });

  constructor() {
    this.loadSavedQuiz();
  }

  submitQuiz(): void {
    const quiz: SavedQuiz = {
      interest: this.interest,
      skinType: this.skinType,
      skinGoal: this.skinGoal,
      budget: this.budget
    };
    localStorage.setItem(this.quizStorageKey, JSON.stringify(quiz));
    this.quizRevision.update(revision => revision + 1);
    this.quizComplete.set(true);
    setTimeout(() => {
      document.getElementById('recommendation-results')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }

  clearProfile(): void {
    localStorage.removeItem(this.quizStorageKey);
    this.interest = 'all';
    this.skinType = 'none';
    this.skinGoal = 'any';
    this.budget = 'any';
    this.quizRevision.update(revision => revision + 1);
    this.quizComplete.set(false);
  }

  toggleFavorite(productId: number): void {
    this.wishlistService.toggle(productId);
  }

  addToCart(product: Product): void {
    if (this.cartService.addProduct(product) === 'limit') {
      alert(`Only ${product.stock} of ${product.name} available.`);
      return;
    }
    this.addedProductIds.update(ids => ids.includes(product.id) ? ids : [...ids, product.id]);
  }

  openAnalysis(product: Product): void {
    this.selectedProduct.set(product);
  }

  joinPremiumPreview(event: SubmitEvent): void {
    event.preventDefault();
    const email = this.premiumEmail.trim();
    if (!email) {
      return;
    }

    localStorage.setItem(this.premiumStorageKey, 'true');
    localStorage.setItem('ecommerce_premium_preview_email', email);
    this.premiumJoined.set(true);
    this.premiumMessage.set('Your premium preview interest is saved on this device.');
  }

  recommendationReason(product: Product): string {
    if (!this.quizComplete()) {
      return 'recommendations.reasonTrending';
    }

    if (this.skinType !== 'none' &&
        product.category.toLowerCase() === 'skincare' &&
        product.description.toLowerCase().includes(this.skinType)) {
      return 'recommendations.reasonSkin';
    }

    const selectedInterest = this.selectedInterest();
    const interestMatch = selectedInterest === 'all' || matchesInterest(product, selectedInterest);
    const budgetMatch = this.budget === 'any' || fitsBudget(product.price, this.budget);
    if (interestMatch && budgetMatch) {
      return 'recommendations.reasonMatch';
    }
    if (interestMatch) {
      return 'recommendations.reasonInterest';
    }
    if (budgetMatch) {
      return 'recommendations.reasonBudget';
    }

    return this.quizComplete()
      ? 'recommendations.reasonPopular'
      : 'recommendations.reasonTrending';
  }

  private selectedInterest(): ShoppingInterest {
    return getRecommendationInterest(this.interest, this.skinType, this.skinGoal);
  }

  private recommendationCandidates(): Product[] {
    return selectRecommendationCandidates(
      this.products(),
      this.interest,
      this.skinType,
      this.skinGoal,
      this.budget
    );
  }

  private loadSavedQuiz(): void {
    const storedQuiz = localStorage.getItem(this.quizStorageKey);
    if (!storedQuiz) {
      return;
    }

    try {
      const saved: unknown = JSON.parse(storedQuiz);
      if (!this.isSavedQuiz(saved)) {
        localStorage.removeItem(this.quizStorageKey);
        return;
      }

      this.interest = saved.interest;
      this.skinType = saved.skinType;
      this.skinGoal = saved.skinGoal;
      this.budget = saved.budget;
      this.quizComplete.set(true);
    } catch {
      localStorage.removeItem(this.quizStorageKey);
    }
  }

  private isSavedQuiz(value: unknown): value is SavedQuiz {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const quiz = value as Partial<SavedQuiz>;
    return ['all', 'skincare', 'electronics', 'fashion'].includes(quiz.interest ?? '') &&
      ['none', 'dry', 'oily', 'combination', 'sensitive'].includes(quiz.skinType ?? '') &&
      ['any', 'hydration', 'oil-balance', 'simple-routine'].includes(quiz.skinGoal ?? '') &&
      ['any', 'under-1000', '1000-5000', 'over-5000'].includes(quiz.budget ?? '');
  }

  private scoreProduct(product: Product): number {
    let score = product.rating;
    const description = `${product.name} ${product.description}`.toLowerCase();

    const selectedInterest = this.selectedInterest();
    if (selectedInterest !== 'all' && matchesInterest(product, selectedInterest)) {
      score += 10;
    }
    if (fitsBudget(product.price, this.budget)) {
      score += 4;
    }
    if (this.skinType !== 'none' &&
        product.category.toLowerCase() === 'skincare' &&
        description.includes(this.skinType)) {
      score += 14;
    }
    if (this.skinGoal === 'hydration' && /hydration|moistur|dry/.test(description)) {
      score += 5;
    }
    if (this.skinGoal === 'oil-balance' && /oily|cleanser|balance/.test(description)) {
      score += 5;
    }
    if (this.skinGoal === 'simple-routine' && /simple|daily|gentle/.test(description)) {
      score += 5;
    }

    return score;
  }

}
