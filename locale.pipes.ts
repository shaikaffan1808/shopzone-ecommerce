import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleService } from '../services/locale.service';

@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly localeService = inject(LocaleService);

  transform(key: string, params: Record<string, string | number> = {}): string {
    this.localeService.locale();
    return this.localeService.translate(key, params);
  }
}

@Pipe({ name: 'localizedNumber', standalone: true, pure: false })
export class LocalizedNumberPipe implements PipeTransform {
  private readonly localeService = inject(LocaleService);

  transform(value: number): string {
    this.localeService.locale();
    return this.localeService.formatNumber(value);
  }
}

@Pipe({ name: 'localizedCurrency', standalone: true, pure: false })
export class LocalizedCurrencyPipe implements PipeTransform {
  private readonly localeService = inject(LocaleService);

  transform(value: number): string {
    this.localeService.locale();
    return this.localeService.formatCurrency(value);
  }
}

@Pipe({ name: 'localizedDate', standalone: true, pure: false })
export class LocalizedDatePipe implements PipeTransform {
  private readonly localeService = inject(LocaleService);

  transform(value: Date | string | number): string {
    this.localeService.locale();
    return this.localeService.formatDate(value);
  }
}
