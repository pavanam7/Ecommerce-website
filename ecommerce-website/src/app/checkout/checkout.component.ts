import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { PaymentService } from '../services/payment.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { finalize, catchError, retry, takeUntil } from 'rxjs/operators';
import { EMPTY, Subject, BehaviorSubject, timer } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { environment } from '../../environments/environment';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var Stripe: any;

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

interface PaymentIntent {
  id: string;
  clientSecret: string;
  status: string;
  amount: number;
  currency: string;
}

interface BillingDetails {
  name: string;
  email: string;
  address: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CurrencyPipe
  ]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  paymentMethods: PaymentMethod[] = [];
  selectedPaymentMethod: string | null = null;
  checkoutForm!: FormGroup;
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string>('');
  success$ = new BehaviorSubject<string>('');
  stripe: any;
  card: any;
  cardErrors: any;
  retryCount = 0;
  maxRetries = 3;
  cartItems: CartItem[] = [];
  private destroy$ = new Subject<void>();
  private messageTimeout: number | null = null;
  private readonly RETRY_DELAY_BASE = 2000; // 2 seconds base delay

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private paymentService: PaymentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.checkoutForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      zip: ['', [Validators.required, Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]]
    });
  }

  async ngOnInit() {
    try {
      await this.initializeStripe();
      await this.loadInitialData();
    } catch (error) {
      console.error('Error during initialization:', error);
      this.showError('Failed to initialize checkout. Please try again later.');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.messageTimeout) {
      window.clearTimeout(this.messageTimeout);
    }
    if (this.card) {
      this.card.destroy();
    }
    this.loading$.complete();
    this.error$.complete();
    this.success$.complete();
  }

  private async initializeStripe(): Promise<void> {
    if (!environment.stripePublishableKey) {
      throw new Error('Stripe publishable key is not configured');
    }

    try {
      this.stripe = Stripe(environment.stripePublishableKey);
      const elements = this.stripe.elements();

      this.card = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            '::placeholder': {
              color: '#aab7c4'
            }
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
        }
      });

      this.card.mount('#card-element');
      this.card.on('change', (event: any) => {
        this.cardErrors = event.error?.message || '';
        if (event.error) {
          this.showError(event.error.message);
        } else {
          this.error$.next('');
        }
      });
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      throw new Error('Failed to initialize payment system');
    }
  }

  private getRetryConfig() {
    return {
      count: this.maxRetries,
      delay: (error: any, retryCount: number) => timer(this.RETRY_DELAY_BASE * Math.pow(2, retryCount))
    };
  }

  private async loadInitialData(): Promise<void> {
    this.loading$.next(true);
    try {
      // Load cart items
      const cartItems = await this.cartService.getCartItems().pipe(
        takeUntil(this.destroy$),
        retry(this.getRetryConfig()),
        catchError((error: Error) => {
          console.error('Failed to load cart items:', error);
          this.showError('Failed to load cart items');
          return EMPTY;
        })
      ).toPromise();

      if (cartItems) {
        this.cartItems = cartItems;
      }

      // Load payment methods
      const methods = await this.paymentService.getPaymentMethods().pipe(
        takeUntil(this.destroy$),
        retry(this.getRetryConfig()),
        catchError((error: Error) => {
          console.error('Failed to load payment methods:', error);
          this.showError('Failed to load payment methods');
          return EMPTY;
        })
      ).toPromise();

      if (methods) {
        this.paymentMethods = methods;
      }
    } finally {
      this.loading$.next(false);
      this.cdr.detectChanges();
    }
  }

  async processPayment(paymentIntent: PaymentIntent): Promise<any> {
    if (!paymentIntent?.clientSecret) {
      throw new Error('Invalid payment intent');
    }

    try {
      const { paymentIntent: confirmedIntent, error } = await this.stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: this.card,
            billing_details: this.getBillingDetails()
          }
        }
      );

      if (error) {
        throw error;
      }

      return confirmedIntent;
    } catch (error: any) {
      if (this.retryCount < this.maxRetries && this.isRetryableError(error)) {
        this.retryCount++;
        const delay = this.RETRY_DELAY_BASE * Math.pow(2, this.retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.processPayment(paymentIntent);
      }
      throw error;
    }
  }

  private getBillingDetails(): BillingDetails {
    const formValue = this.checkoutForm.value;
    return {
      name: formValue.name,
      email: formValue.email,
      address: {
        line1: formValue.address,
        city: formValue.city,
        state: formValue.state,
        postal_code: formValue.zip,
        country: 'US' // Make this configurable if needed
      }
    };
  }

  private isRetryableError(error: any): boolean {
    const retryableErrors = [
      'network_error',
      'timeout_error',
      'api_connection_error',
      'rate_limit_error',
      'service_unavailable'
    ];
    return retryableErrors.includes(error.type);
  }

  async onSubmit() {
    if (this.checkoutForm.invalid) {
      this.markFormGroupTouched(this.checkoutForm);
      this.showError('Please fill in all required fields correctly');
      return;
    }

    if (this.cartItems.length === 0) {
      this.showError('Your cart is empty');
      return;
    }

    this.loading$.next(true);
    this.error$.next('');
    this.retryCount = 0;

    try {
      const totalAmount = this.cartService.calculateTotal(this.cartItems);
      if (totalAmount <= 0) {
        throw new Error('Invalid cart total');
      }

      const currency = 'USD'; // Should be configurable

      // Create payment intent
      const paymentIntent = await this.paymentService.createPaymentIntent(
        totalAmount,
        currency
      ).pipe(
        retry(this.getRetryConfig()),
        catchError((error: Error) => {
          console.error('Failed to create payment intent:', error);
          throw error;
        })
      ).toPromise();

      if (!paymentIntent) {
        throw new Error('Failed to create payment intent');
      }

      // Process payment
      const confirmedIntent = await this.processPayment(paymentIntent);

      if (confirmedIntent.status === 'succeeded') {
        // Clear cart and show success message
        await this.cartService.clearCart().toPromise();
        this.showSuccessMessage('Payment successful! Redirecting...');

        // Create order record
        const order = {
          items: this.cartItems,
          total: totalAmount,
          paymentId: confirmedIntent.id,
          billingDetails: this.getBillingDetails()
        };

        // Save order details
        await this.paymentService.saveOrder(order).pipe(
          retry(this.getRetryConfig()),
          catchError((error: Error) => {
            console.error('Failed to save order:', error);
            // Don't throw here, as payment was successful
            return EMPTY;
          })
        ).toPromise();

        // Navigate to success page
        setTimeout(() => {
          this.router.navigate(['/checkout/success'], {
            state: { 
              paymentIntent: confirmedIntent,
              order: order
            }
          });
        }, 2000);
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (error: any) {
      const errorMessage = this.getErrorMessage(error);
      this.showError(errorMessage);
      console.error('Payment error:', error);

      // Navigate to failure page
      this.router.navigate(['/checkout/failure'], {
        state: { 
          error: errorMessage,
          cartItems: this.cartItems // So they can try again with same items
        }
      });
    } finally {
      this.loading$.next(false);
      this.cdr.detectChanges();
    }
  }

  private getErrorMessage(error: any): string {
    if (error.type === 'card_error' || error.type === 'validation_error') {
      return error.message;
    }

    const errorMessages: { [key: string]: string } = {
      card_error: 'Your card was declined. Please try a different card.',
      validation_error: 'Please check your payment details and try again.',
      rate_limit_error: 'Too many requests. Please try again in a few minutes.',
      network_error: 'Network error occurred. Please check your connection and try again.',
      api_connection_error: 'Unable to connect to payment service. Please try again.',
      authentication_error: 'Authentication failed. Please try again.',
      invalid_request_error: 'Invalid payment request. Please try again.',
      server_error: 'Server error occurred. Please try again later.',
      service_unavailable: 'Service is temporarily unavailable. Please try again later.',
    };

    return errorMessages[error.type] || error.message || 'Payment failed. Please try again.';
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private showError(message: string): void {
    this.error$.next(message);
    this.success$.next('');
  }

  private showSuccessMessage(message: string): void {
    this.success$.next(message);
    this.error$.next('');
    if (this.messageTimeout) {
      window.clearTimeout(this.messageTimeout);
    }
    this.messageTimeout = window.setTimeout(() => {
      this.success$.next('');
      this.cdr.detectChanges();
    }, 5000);
  }

  // Getters for template
  get loading(): boolean {
    return this.loading$.value;
  }

  get error(): string {
    return this.error$.value;
  }

  get successMessage(): string {
    return this.success$.value;
  }

  get totalAmount(): number {
    return this.cartService.calculateTotal(this.cartItems);
  }

  get formControls() {
    return this.checkoutForm.controls;
  }
}
