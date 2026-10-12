import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates and authenticates the default admin only for the admin role', () => {
    const auth = new AuthService();

    const customerLogin = auth.login('admin@ecommerce.com', 'admin123', 'user');
    expect(customerLogin.success).toBe(false);
    expect(customerLogin.code).toBe('role-mismatch');
    expect(auth.currentUser()).toBeNull();

    const adminLogin = auth.login('admin@ecommerce.com', 'admin123', 'admin');
    expect(adminLogin.success).toBe(true);
    expect(auth.isAdmin()).toBe(true);
  });

  it('keeps customer accounts from signing in through the admin option', () => {
    const auth = new AuthService();
    expect(auth.signup('Shopper', 'shopper@example.test', 'shopper123').success).toBe(true);

    const result = auth.login('shopper@example.test', 'shopper123', 'admin');
    expect(result.success).toBe(false);
    expect(result.code).toBe('role-mismatch');
    expect(auth.currentUser()).toBeNull();
  });
});
