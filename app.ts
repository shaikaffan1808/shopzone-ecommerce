import { Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterOutlet
} from '@angular/router';

import { AuthService } from './services/auth.service';
import { Footer } from './footer/footer';
import { LocaleService, SupportedLocale } from './services/locale.service';
import { TranslatePipe } from './pipes/locale.pipes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, Footer, TranslatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  authService = inject(AuthService);
  router = inject(Router);
  localeService = inject(LocaleService);

  setLocale(locale: SupportedLocale): void {
    this.localeService.setLocale(locale);
  }

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/login']);

  }
}
