import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Order {
  items: any[];
  total: number;
  paymentId: string;
  billingDetails: {
    name: string;
    email: string;
    address: {
      line1: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
}

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="success-container">
      <div class="success-content">
        <div class="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-circle">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase. Your order has been confirmed.</p>
        
        <div class="order-details" *ngIf="order">
          <h2>Order Details</h2>
          <div class="order-info">
            <p><strong>Order ID:</strong> {{ paymentIntent?.id }}</p>
            <p><strong>Total Amount:</strong> {{ formatAmount(order.total) }}</p>
          </div>

          <div class="billing-details">
            <h3>Billing Details</h3>
            <p><strong>Name:</strong> {{ order.billingDetails.name }}</p>
            <p><strong>Email:</strong> {{ order.billingDetails.email }}</p>
            <p><strong>Address:</strong></p>
            <p class="address">
              {{ order.billingDetails.address.line1 }}<br>
              {{ order.billingDetails.address.city }}, {{ order.billingDetails.address.state }} {{ order.billingDetails.address.postal_code }}<br>
              {{ order.billingDetails.address.country }}
            </p>
          </div>

          <div class="items-list">
            <h3>Items Purchased</h3>
            <div class="item" *ngFor="let item of order.items">
              <p>
                <span class="item-name">{{ item.name }}</span>
                <span class="item-quantity">x{{ item.quantity }}</span>
                <span class="item-price">{{ formatAmount(item.price * item.quantity) }}</span>
              </p>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="primary-button" (click)="viewOrders()">View Orders</button>
          <button class="secondary-button" (click)="continueShopping()">Continue Shopping</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .success-content {
      text-align: center;
      max-width: 800px;
      padding: 2rem;
      background: var(--surface-color);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .success-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      color: var(--success-color);

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
    }

    h3 {
      color: var(--text-color);
      margin: 1rem 0;
      font-size: 1.2rem;
      text-align: left;
    }

    p {
      color: var(--text-muted);
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }

    .order-details {
      margin: 2rem 0;
      padding: 2rem;
      background: var(--surface-alt);
      border-radius: 4px;
      text-align: left;

      .order-info {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);

        p {
          margin-bottom: 0.5rem;
        }
      }

      .billing-details {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);

        .address {
          margin-left: 1rem;
          color: var(--text-color);
        }
      }

      .items-list {
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
      }
    }
  `]
})
export class CheckoutSuccessComponent implements OnInit {
  paymentIntent: any;
  order: Order | null = null;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.paymentIntent = navigation.extras.state['paymentIntent'];
      this.order = navigation.extras.state['order'];
    }
  }

  ngOnInit(): void {
    if (!this.paymentIntent || !this.order) {
      this.router.navigate(['/']);
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  viewOrders(): void {
    this.router.navigate(['/orders']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
} 