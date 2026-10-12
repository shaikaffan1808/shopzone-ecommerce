import { Product } from '../product';
import {
  getRecommendationInterest,
  selectRecommendationCandidates
} from './recommendation-matcher';

describe('recommendation matching', () => {
  const products: Product[] = [
    { id: 1, name: 'Cream', description: 'Dry skin cream', price: 799, category: 'Skincare', image: '', rating: 4.6, stock: 4 },
    { id: 2, name: 'Cleanser', description: 'Oily skin cleanser', price: 549, category: 'Skincare', image: '', rating: 4.4, stock: 3 },
    { id: 3, name: 'Shoes', description: 'Running shoes', price: 2499, category: 'Fashion', image: '', rating: 4.1, stock: 5 },
    { id: 4, name: 'Laptop', description: 'Laptop', price: 54999, category: 'Laptops', image: '', rating: 4.5, stock: 2 },
    { id: 5, name: 'Unavailable skincare', description: 'Skin lotion', price: 399, category: 'Skincare', image: '', rating: 4.9, stock: 0 }
  ];

  it('treats a skin preference as a skincare category when no other category is selected', () => {
    expect(getRecommendationInterest('all', 'dry', 'any')).toBe('skincare');
    expect(selectRecommendationCandidates(products, 'all', 'dry', 'any', 'any').map(product => product.id))
      .toEqual([1, 2]);
  });

  it('keeps explicit category selections strict', () => {
    expect(selectRecommendationCandidates(products, 'fashion', 'dry', 'hydration', 'any').map(product => product.id))
      .toEqual([3]);
    expect(selectRecommendationCandidates(products, 'electronics', 'none', 'any', 'any').map(product => product.id))
      .toEqual([4]);
  });

  it('keeps category matches when no products in that category fit the budget', () => {
    expect(selectRecommendationCandidates(products, 'fashion', 'none', 'any', 'under-1000').map(product => product.id))
      .toEqual([3]);
  });

  it('relaxes the budget only within the selected category', () => {
    expect(selectRecommendationCandidates(products, 'electronics', 'none', 'any', 'under-1000').map(product => product.id))
      .toEqual([4]);
  });

  it('returns no recommendations rather than unrelated categories when the selected category is unavailable', () => {
    expect(selectRecommendationCandidates([products[3]], 'fashion', 'none', 'any', 'any'))
      .toEqual([]);
  });
});
