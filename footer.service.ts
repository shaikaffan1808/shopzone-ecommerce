import { Injectable, signal } from '@angular/core';
import { FooterContent } from '../models/footer';

export const DEFAULT_FOOTER: FooterContent = {
  tagline: 'Everything you need, delivered to your doorstep.',
  address: '123 Market Street, Chennai, Tamil Nadu, India',
  email: 'support@shopzone.com',
  phone: '+91 98765 43210',
  copyright: 'ShopZone. All rights reserved.'
};

@Injectable({
  providedIn: 'root'
})
export class FooterService {

  private readonly storageKey = 'ecommerce_footer';

  private footerSignal = signal<FooterContent>(this.load());

  footer = this.footerSignal.asReadonly();

  private load(): FooterContent {

    const data = localStorage.getItem(this.storageKey);

    try {
      return data
        ? { ...DEFAULT_FOOTER, ...JSON.parse(data) }
        : { ...DEFAULT_FOOTER };
    } catch {
      return { ...DEFAULT_FOOTER };
    }
  }

  update(content: FooterContent): void {

    const clean: FooterContent = {
      tagline: content.tagline.trim(),
      address: content.address.trim(),
      email: content.email.trim(),
      phone: content.phone.trim(),
      copyright: content.copyright.trim()
    };

    localStorage.setItem(this.storageKey, JSON.stringify(clean));

    this.footerSignal.set(clean);
  }

  reset(): void {

    localStorage.removeItem(this.storageKey);

    this.footerSignal.set({ ...DEFAULT_FOOTER });
  }
}
