import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private currencies: Currency[] = [
    { code: 'USD', symbol: '$', rate: 1 },
    { code: 'EUR', symbol: '€', rate: 0.92 },
    { code: 'GBP', symbol: '£', rate: 0.79 }
  ];

  private currentCurrency = new BehaviorSubject<Currency>(this.currencies[0]);
  currentCurrency$ = this.currentCurrency.asObservable();

  constructor() {}

  getCurrencies(): Currency[] {
    return this.currencies;
  }

  setCurrency(currencyCode: string) {
    const currency = this.currencies.find(c => c.code === currencyCode);
    if (currency) {
      this.currentCurrency.next(currency);
    }
  }

  convertPrice(price: number): number {
    const currency = this.currentCurrency.value;
    return price * currency.rate;
  }

  formatPrice(price: number): string {
    const currency = this.currentCurrency.value;
    const convertedPrice = this.convertPrice(price);
    return `${currency.symbol}${convertedPrice.toFixed(2)}`;
  }
}
