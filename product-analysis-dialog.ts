import { Component, HostListener, computed, inject, input, output } from '@angular/core';
import { Product } from '../product';
import { TranslatePipe } from '../pipes/locale.pipes';
import { LocaleService } from '../services/locale.service';

export type AnalysisInterest = 'all' | 'skincare' | 'electronics' | 'fashion';
export type AnalysisSkinType = 'none' | 'dry' | 'oily' | 'combination' | 'sensitive';
export type AnalysisBudget = 'any' | 'under-1000' | '1000-5000' | 'over-5000';

export interface AnalysisProfile {
  interest: AnalysisInterest;
  skinType: AnalysisSkinType;
  budget: AnalysisBudget;
}

interface AnalysisInsight {
  title: string;
  detail: string;
}

@Component({
  selector: 'app-product-analysis-dialog',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './product-analysis-dialog.html',
  styleUrl: './product-analysis-dialog.css'
})
export class ProductAnalysisDialog {
  private readonly localeService = inject(LocaleService);

  readonly product = input.required<Product>();
  readonly profile = input.required<AnalysisProfile>();
  readonly isFavorite = input(false);
  readonly closed = output<void>();
  readonly favoriteToggled = output<number>();

  readonly analysis = computed(() => {
    const product = this.product();
    const profile = this.profile();
    const category = product.category.toLowerCase();
    const description = `${product.name} ${product.description}`.toLowerCase();
    const insights: AnalysisInsight[] = [
      {
        title: this.translate('analysis.catalogFacts'),
        detail: this.translate('analysis.catalogFactsDetail', {
          rating: product.rating,
          stock: product.stock
        })
      }
    ];

    if (profile.interest !== 'all' && this.matchesInterest(category, profile.interest)) {
      insights.push({
        title: this.translate('analysis.interestMatch'),
        detail: this.translate('analysis.interestMatchDetail', {
          interest: this.interestLabel(profile.interest)
        })
      });
    }

    if (profile.budget !== 'any') {
      const budgetMatches = this.matchesBudget(product.price, profile.budget);
      insights.push({
        title: this.translate(budgetMatches ? 'analysis.budgetMatch' : 'analysis.budgetOutside'),
        detail: this.translate(
          budgetMatches ? 'analysis.budgetMatchDetail' : 'analysis.budgetOutsideDetail',
          { price: this.formatCurrency(product.price), budget: this.budgetLabel(profile.budget) }
        )
      });
    }

    if (profile.skinType !== 'none' && category === 'skincare') {
      const mentionsSkinType = description.includes(profile.skinType);
      insights.push({
        title: this.translate('analysis.cosmeticProfile'),
        detail: this.translate(
          mentionsSkinType ? 'analysis.cosmeticMatchDetail' : 'analysis.cosmeticNoClaimDetail',
          { skinType: this.skinTypeLabel(profile.skinType) }
        )
      });
    }

    return insights;
  });

  close(): void {
    this.closed.emit();
  }

  toggleFavorite(): void {
    this.favoriteToggled.emit(this.product().id);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  private translate(key: string, params: Record<string, string | number> = {}): string {
    return this.localeService.translate(key, params);
  }

  private formatCurrency(value: number): string {
    return this.localeService.formatCurrency(value);
  }

  private matchesInterest(category: string, interest: AnalysisInterest): boolean {
    switch (interest) {
      case 'skincare':
        return category === 'skincare';
      case 'electronics':
        return /electronics|mobiles|laptops|cameras|wearables/.test(category);
      case 'fashion':
        return /fashion|clothing|shoes/.test(category);
      default:
        return false;
    }
  }

  private matchesBudget(price: number, budget: AnalysisBudget): boolean {
    switch (budget) {
      case 'under-1000':
        return price <= 1000;
      case '1000-5000':
        return price > 1000 && price <= 5000;
      case 'over-5000':
        return price > 5000;
      default:
        return true;
    }
  }

  private interestLabel(interest: AnalysisInterest): string {
    return this.translate(`analysis.interest.${interest}`);
  }

  private budgetLabel(budget: AnalysisBudget): string {
    return this.translate(`analysis.budget.${budget}`);
  }

  private skinTypeLabel(skinType: AnalysisSkinType): string {
    return this.translate(`analysis.skinType.${skinType}`);
  }
}
