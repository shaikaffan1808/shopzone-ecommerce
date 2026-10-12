import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/locale.pipes';
import { UserRole } from '../../models/user';
import { LocaleService } from '../../services/locale.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router);
  private localeService = inject(LocaleService);

  private readonly rememberedEmailKey = 'ecommerce_remembered_email';

  email = localStorage.getItem(this.rememberedEmailKey) ?? '';
  password = '';
  selectedRole: UserRole = 'user';
  rememberEmail = Boolean(this.email);
  showPassword = signal(false);

  errorMessage = '';

  selectRole(role: UserRole): void {
    this.selectedRole = role;
    this.errorMessage = '';
  }

  fillDemoAdmin(): void {
    this.email = 'admin@ecommerce.com';
    this.password = 'admin123';
    this.errorMessage = '';
  }

  login(): void {

    this.errorMessage = '';

    if (!this.email || !this.password) {

      this.errorMessage =
        'Please enter email and password.';

      return;
    }

    const result = this.authService.login(
      this.email,
      this.password,
      this.selectedRole
    );

    if (!result.success) {
      this.errorMessage = result.code === 'role-mismatch'
        ? this.localeService.translate(
          this.selectedRole === 'admin'
            ? 'auth.customerAccountOnly'
            : 'auth.adminAccountOnly'
        )
        : result.message;

      return;
    }

    if (this.rememberEmail) {
      localStorage.setItem(this.rememberedEmailKey, this.email.trim());
    } else {
      localStorage.removeItem(this.rememberedEmailKey);
    }

    const user = this.authService.currentUser();

    if (user?.role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}