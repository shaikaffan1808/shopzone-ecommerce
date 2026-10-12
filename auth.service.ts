import { Injectable, signal } from '@angular/core';
import { User, UserRole } from '../models/user';

export interface AuthResult {
  success: boolean;
  message: string;
  code?: 'role-mismatch';
}

const DEFAULT_ADMIN_EMAIL = 'admin@ecommerce.com';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly usersKey = 'ecommerce_users';
  private readonly currentUserKey = 'ecommerce_current_user';

  private usersSignal = signal<User[]>(this.getUsers());
  private currentUserSignal = signal<User | null>(
    this.getStoredUser()
  );

  users = this.usersSignal.asReadonly();
  currentUser = this.currentUserSignal.asReadonly();

  constructor() {
    this.initializeDefaultAdmin();
  }

  private initializeDefaultAdmin(): void {

    const users = this.getUsers();

    const adminExists = users.some(
      user => user.email.toLowerCase() === DEFAULT_ADMIN_EMAIL
    );

    if (!adminExists) {

      const admin: User = {
        id: 1,
        name: 'Administrator',
        email: DEFAULT_ADMIN_EMAIL,
        password: 'admin123',
        role: 'admin'
      };

      this.saveUsers([...users, admin]);
    }
  }

  private getUsers(): User[] {

    const data = localStorage.getItem(this.usersKey);

    try {
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: User[]): void {

    localStorage.setItem(
      this.usersKey,
      JSON.stringify(users)
    );

    this.usersSignal.set(users);
  }

  private getStoredUser(): User | null {

    const data = localStorage.getItem(this.currentUserKey);

    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private createUser(
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): AuthResult {

    name = name.trim();
    email = email.trim();

    if (!name || !email || !password) {
      return {
        success: false,
        message: 'Name, email and password are required.'
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        message: 'Please enter a valid email address.'
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: 'Password must contain at least 6 characters.'
      };
    }

    const users = this.getUsers();

    const existingUser = users.find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return {
        success: false,
        message: 'Email already registered.'
      };
    }

    const newUser: User = {
      id: Date.now(),
      name,
      email,
      password,
      role
    };

    this.saveUsers([...users, newUser]);

    return {
      success: true,
      message: 'Account created successfully.'
    };
  }

  signup(
    name: string,
    email: string,
    password: string
  ): AuthResult {

    return this.createUser(name, email, password, 'user');
  }

  /** Admin only: create a user (or another admin) from the dashboard. */
  addUser(
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): AuthResult {

    if (!this.isAdmin()) {
      return {
        success: false,
        message: 'Only admins can add users.'
      };
    }

    const result = this.createUser(name, email, password, role);

    return result.success
      ? { success: true, message: `User ${email.trim()} added.` }
      : result;
  }

  /** Admin only: remove a user. The default admin and yourself are protected. */
  deleteUser(id: number): AuthResult {

    if (!this.isAdmin()) {
      return {
        success: false,
        message: 'Only admins can delete users.'
      };
    }

    const target = this.getUsers().find(user => user.id === id);

    if (!target) {
      return { success: false, message: 'User not found.' };
    }

    if (target.email.toLowerCase() === DEFAULT_ADMIN_EMAIL) {
      return {
        success: false,
        message: 'The default administrator cannot be deleted.'
      };
    }

    if (target.id === this.currentUserSignal()?.id) {
      return {
        success: false,
        message: 'You cannot delete your own account.'
      };
    }

    this.saveUsers(
      this.getUsers().filter(user => user.id !== id)
    );

    return { success: true, message: `User ${target.email} deleted.` };
  }

  login(
    email: string,
    password: string,
    expectedRole?: UserRole
  ): AuthResult {

    const users = this.getUsers();

    const user = users.find(
      item =>
        item.email.toLowerCase() === email.toLowerCase() &&
        item.password === password
    );

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password.'
      };
    }

    if (expectedRole && user.role !== expectedRole) {
      return {
        success: false,
        message: expectedRole === 'admin'
          ? 'This account is a customer account. Choose customer login.'
          : 'This account is an admin account. Choose admin login.',
        code: 'role-mismatch'
      };
    }

    localStorage.setItem(
      this.currentUserKey,
      JSON.stringify(user)
    );

    this.currentUserSignal.set(user);

    return {
      success: true,
      message: 'Login successful.'
    };
  }

  logout(): void {

    localStorage.removeItem(this.currentUserKey);

    this.currentUserSignal.set(null);
  }

  isLoggedIn(): boolean {

    return this.currentUserSignal() !== null;
  }

  isAdmin(): boolean {

    return this.currentUserSignal()?.role === 'admin';
  }

  getUsersForAdmin(): User[] {

    return this.getUsers();
  }
}
