import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface PaymentIntent {
  id: string;
  clientSecret: string;
  status: string;
  amount: number;
  currency: string;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiUrl = environment.paymentApiUrl;
  private readonly apiKey = environment.paymentApiKey;
  private readonly maxRetries = 3;

  constructor(private http: HttpClient) { }

  processPayment(paymentData: {
    amount: number;
    currency: string;
    paymentMethod: string;
    customerEmail: string;
    description: string;
  }): Observable<any> {
    const payload = {
      amount: Math.round(paymentData.amount * 100), // Convert to cents and ensure integer
      currency: paymentData.currency,
      source: paymentData.paymentMethod,
      receipt_email: paymentData.customerEmail,
      description: paymentData.description
    };

    return this.http.post(`${this.apiUrl}/charges`, payload, {
      headers: this.getHeaders()
    }).pipe(
      retry(this.maxRetries),
      catchError(this.handleError)
    );
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/payment-methods`, {
      headers: this.getHeaders()
    }).pipe(
      retry(this.maxRetries),
      catchError(this.handleError)
    );
  }

  createPaymentIntent(amount: number, currency: string): Observable<PaymentIntent> {
    const payload = {
      amount: Math.round(amount * 100), // Convert to cents and ensure integer
      currency: currency.toLowerCase()
    };

    return this.http.post<PaymentIntent>(`${this.apiUrl}/payment-intents`, payload, {
      headers: this.getHeaders()
    }).pipe(
      retry(this.maxRetries),
      map(response => this.transformPaymentIntent(response)),
      catchError(this.handleError)
    );
  }

  saveOrder(order: {
    items: any[];
    total: number;
    paymentId: string;
    billingDetails: any;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, order, {
      headers: this.getHeaders()
    }).pipe(
      retry(this.maxRetries),
      catchError(this.handleError)
    );
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  private transformPaymentIntent(response: any): PaymentIntent {
    if (!response.client_secret) {
      throw new Error('Invalid payment intent response');
    }

    return {
      id: response.id,
      clientSecret: response.client_secret,
      status: response.status,
      amount: response.amount,
      currency: response.currency
    };
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred while processing your payment.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid payment request. Please check your payment details.';
          break;
        case 401:
          errorMessage = 'Payment authentication failed. Please try again.';
          break;
        case 402:
          errorMessage = 'Payment required. Your card may have been declined.';
          break;
        case 403:
          errorMessage = 'Payment forbidden. Please contact support.';
          break;
        case 404:
          errorMessage = 'Payment service not found. Please try again later.';
          break;
        case 429:
          errorMessage = 'Too many payment attempts. Please wait and try again.';
          break;
        case 500:
          errorMessage = 'Payment server error. Please try again later.';
          break;
        case 503:
          errorMessage = 'Payment service unavailable. Please try again later.';
          break;
        default:
          errorMessage = `Payment error: ${error.status} - ${error.message}`;
      }
    }

    console.error('Payment error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
