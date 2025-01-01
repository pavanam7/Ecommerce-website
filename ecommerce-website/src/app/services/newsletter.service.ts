import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NewsletterSubscription {
  email: string;
  categories: string[];
  preferences?: {
    promotions?: boolean;
    newProducts?: boolean;
    specialOffers?: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  constructor(private http: HttpClient) {}

  subscribe(subscription: NewsletterSubscription): Observable<any> {
    return this.http.post('/api/newsletter/subscribe', subscription);
  }

  unsubscribe(email: string): Observable<any> {
    return this.http.post('/api/newsletter/unsubscribe', { email });
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>('/api/newsletter/categories');
  }

  updatePreferences(email: string, preferences: any): Observable<any> {
    return this.http.put('/api/newsletter/preferences', { email, preferences });
  }
}
