import { Component, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/locale.pipes';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './newsletter.html',
  styleUrl: './newsletter.css'
})
export class Newsletter {
  subscribedEmail = signal('');

  subscribe(event: SubmitEvent, emailInput: HTMLInputElement): void {
    event.preventDefault();
    const email = emailInput.value.trim();
    if (!email) {
      return;
    }

    localStorage.setItem('ecommerce_newsletter_email', email);
    this.subscribedEmail.set(email);
    emailInput.value = '';
  }
}
