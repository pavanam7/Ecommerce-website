import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/cart-item.model';

@Component({
  selector: 'app-checkout-failure',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="failure-container">
      <div class="failure-content">
        <div class="failure-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x-circle">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h1>Payment Failed</h1>
        <p>We're sorry, but there was an issue processing your payment.</p>
        
        <div class="error-details" *ngIf="error">
          <p>{{ error }}</p>
        </div>

        <div class="cart-summary" *ngIf="cartItems.length > 0">
          <h2>Cart Summary</h2>
          <div class="items-list">
            <div class="item" *ngFor="let item of cartItems">
              <p>
                <span class="item-name">{{ item.product.name }}</span>
                <span class="item-quantity">x{{ item.quantity }}</span>
                <span class="item-price">{{ formatAmount(item.product.price * item.quantity) }}</span>
              </p>
            </div>
          </div>
          <div class="total">
            <p>
              <strong>Total:</strong>
              <span>{{ formatAmount(calculateTotal()) }}</span>
            </p>
          </div>
        </div>

        <div class="actions">
          <button class="primary-button" (click)="tryAgain()">Try Again</button>
          <button class="secondary-button" (click)="contactSupport()">Contact Support</button>
          <button class="tertiary-button" (click)="editCart()">Edit Cart</button>
        </div>

        <div class="help-text">
          <p>If you continue to experience issues, please contact our support team.</p>
          <p>Your cart items have been saved and you can try the payment again.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .failure-container {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .failure-content {
      text-align: center;
      max-width: 800px;
      padding: 2rem;
      background: var(--surface-color);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .failure-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      color: var(--error-color);

      svg {
        width: 100%;
        height: 100%;
      }
    }

    h1 {
      color: var(--text-color);
      margin-bottom: 1rem;
      font-size: 2rem;
    }

    h2 {
      color: var(--text-color);
      margin: 1rem 0;
      font-size: 1.5rem;
      text-align: left;
    }

    p {
      color: var(--text-muted);
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }

    .error-details {
      margin: 1.5rem 0;
      padding: 1.5rem;
      background: var(--error-bg);
      border-radius: 4px;
      border: 1px solid var(--error-border);

      p {
        margin-bottom: 0;
        color: var(--error-color);
        font-size: 1rem;
      }
    }

    .cart-summary {
      margin: 2rem 0;
      padding: 1.5rem;
      background: var(--surface-alt);
      border-radius: 4px;
      text-align: left;

      .items-list {
        margin: 1rem 0;

        .item {
          display: flex;
          margin-bottom: 0.5rem;

          p {
            width: 100%;
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            color: var(--text-color);
          }

          .item-name {
            flex: 1;
          }

          .item-quantity {
            margin: 0 1rem;
            color: var(--text-muted);
          }

          .item-price {
            font-weight: 500;
          }
        }
      }

      .total {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);

        p {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0;
          color: var(--text-color);
          font-size: 1.2rem;
        }
      }
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;

      button {
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;

        &.primary-button {
          background: var(--primary-color);
          color: white;
          border: none;

          &:hover {
            background: var(--primary-dark);
          }
        }

        &.secondary-button {
          background: transparent;
          color: var(--primary-color);
          border: 1px solid var(--primary-color);

          &:hover {
            background: var(--primary-color);
            color: white;
          }
        }

        &.tertiary-button {
          background: transparent;
          color: var(--text-muted);
          border: 1px solid var(--border-color);

          &:hover {
            background: var(--surface-alt);
            border-color: var(--text-muted);
          }
        }
      }
    }

    .help-text {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);

      p {
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: var(--text-muted);

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  `]
})
export class CheckoutFailureComponent implements OnInit {
  error: string | null = null;
  cartItems: CartItem[] = [];

  constructor(
    private router: Router,
    private cartService: CartService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.error = navigation.extras.state['error'];
      this.cartItems = navigation.extras.state['cartItems'] || [];
    }
  }

  ngOnInit(): void {
    if (!this.error) {
      this.error = 'An unknown error occurred during payment processing.';
    }

    // Ensure cart is populated with the items from the failed payment
    if (this.cartItems.length > 0) {
      this.cartService.setCartItems(this.cartItems).subscribe(
        () => {
          console.log('Cart items restored from failed payment');
        },
        error => {
          console.error('Error restoring cart items:', error);
          this.error = 'Failed to restore cart items. Please try again.';
        }
      );
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  calculateTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  tryAgain(): void {
    this.router.navigate(['/checkout']);
  }

  contactSupport(): void {
    this.router.navigate(['/support']);
  }

  editCart(): void {
    this.router.navigate(['/cart']);
  }
} 