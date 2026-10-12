import { WishlistService } from './wishlist.service';

describe('WishlistService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds, removes, and persists favorite product IDs', () => {
    const wishlist = new WishlistService();

    wishlist.toggle(7);
    expect(wishlist.productIds()).toEqual([7]);
    expect(JSON.parse(localStorage.getItem('ecommerce_wishlist') ?? '[]')).toEqual([7]);

    wishlist.toggle(7);
    expect(wishlist.productIds()).toEqual([]);
  });

  it('ignores malformed or invalid saved IDs', () => {
    localStorage.setItem('ecommerce_wishlist', JSON.stringify([2, -1, '3', 0]));
    expect(new WishlistService().productIds()).toEqual([2]);

    localStorage.setItem('ecommerce_wishlist', '{invalid');
    expect(new WishlistService().productIds()).toEqual([]);
  });
});
