import { Product } from '../product';

export type ShoppingInterest = 'all' | 'skincare' | 'electronics' | 'fashion';
export type SkinType = 'none' | 'dry' | 'oily' | 'combination' | 'sensitive';
export type SkinGoal = 'any' | 'hydration' | 'oil-balance' | 'simple-routine';
export type Budget = 'any' | 'under-1000' | '1000-5000' | 'over-5000';

export function getRecommendationInterest(
  interest: ShoppingInterest,
  skinType: SkinType,
  skinGoal: SkinGoal
): ShoppingInterest {
  if (interest !== 'all') {
    return interest;
  }

  return skinType !== 'none' || skinGoal !== 'any' ? 'skincare' : 'all';
}

export function selectRecommendationCandidates(
  products: Product[],
  interest: ShoppingInterest,
  skinType: SkinType,
  skinGoal: SkinGoal,
  budget: Budget
): Product[] {
  const available = products.filter(product => product.stock > 0);
  const selectedInterest = getRecommendationInterest(interest, skinType, skinGoal);
  const categoryMatches = selectedInterest === 'all'
    ? available
    : available.filter(product => matchesInterest(product, selectedInterest));

  if (budget === 'any') {
    return categoryMatches;
  }

  const budgetMatches = categoryMatches.filter(product => fitsBudget(product.price, budget));
  return budgetMatches.length > 0 ? budgetMatches : categoryMatches;
}

export function matchesInterest(product: Product, interest: ShoppingInterest): boolean {
  const category = product.category.toLowerCase();
  switch (interest) {
    case 'skincare':
      return /skincare|skin care|cosmetic|beauty/.test(category);
    case 'electronics':
      return /electronics|mobiles|laptops|cameras|wearables/.test(category);
    case 'fashion':
      return /fashion|clothing|shoes|apparel/.test(category);
    default:
      return false;
  }
}

export function fitsBudget(price: number, budget: Budget): boolean {
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
