import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/locale.pipes';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {

  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  errorMessage = '';

  signup(): void {

    this.errorMessage = '';

    if (
      !this.name ||
      !this.email ||
      !this.password ||
      !this.confirmPassword
    ) {

      this.errorMessage =
        'Please fill all fields.';

      return;
    }

    if (this.password !== this.confirmPassword) {

      this.errorMessage =
        'Passwords do not match.';

      return;
    }

    if (this.password.length < 6) {

      this.errorMessage =
        'Password must contain at least 6 characters.';

      return;
    }

    const result = this.authService.signup(
      this.name,
      this.email,
      this.password
    );

    if (!result.success) {

      this.errorMessage = result.message;

      return;
    }

    this.router.navigate(['/login']);
  }
}