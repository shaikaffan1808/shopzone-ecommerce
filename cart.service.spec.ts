import { CartService } from './cart.service';
import { Product } from '../product';

describe('CartService', () => {
  const product: Product = {
    id: 7,
    name: 'Test item',
    description: 'A test product',
    price: 250,
    category: 'Accessories',
    image: '',
    rating: 4,
    stock: 2
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('adds an item and increments its quantity', () => {
    const cart = new CartService();

    expect(cart.addProduct(product)).toBe('added');
    expect(cart.addProduct(product)).toBe('added');
    expect(JSON.parse(localStorage.getItem('ecommerce_cart') ?? '[]')).toEqual([
      { product, quantity: 2 }
    ]);
  });

  it('prevents adding beyond available stock', () => {
    const cart = new CartService();
    cart.addProduct(product);
    cart.addProduct(product);

    expect(cart.addProduct(product)).toBe('limit');
    expect(JSON.parse(localStorage.getItem('ecommerce_cart') ?? '[]')[0].quantity).toBe(2);
  });
});
