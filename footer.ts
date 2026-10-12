import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterService } from '../services/footer.service';
import { AuthService } from '../services/auth.service';
import { TranslatePipe } from '../pipes/locale.pipes';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {

  footerService = inject(FooterService);
  authService = inject(AuthService);

  year = new Date().getFullYear();
}
