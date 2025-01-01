import { Component } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService, Order } from '../services/order.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, CurrencyPipe],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss']
})
export class OrderTrackingComponent {
  trackingForm: FormGroup;
  orderDetails: Order | null = null;
  orderHistory: Order[] = [];
  loading = false;
  errorMessage = '';
  isLoggedIn = false;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private authService: AuthService
  ) {
    this.trackingForm = this.fb.group({
      orderId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      this.loadOrderHistory();
    }
  }

  async trackOrder() {
    if (this.trackingForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.orderDetails = null;

    try {
      const { orderId, email } = this.trackingForm.value;
      const order = await this.orderService.getOrderDetails(orderId, email).toPromise();
      if (order) {
        this.orderDetails = order;
      } else {
        throw new Error('Order not found');
      }
    } catch (error: any) {
      this.errorMessage = error?.message || 'Failed to fetch order details. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async loadOrderHistory() {
    try {
      const user = await this.authService.getCurrentUser();
      if (user?.id) {
      const history = await this.orderService.getOrderHistory(user.id).toPromise();
      this.orderHistory = history || [];
      }
    } catch (error) {
      console.error('Failed to load order history', error);
    }
  }

  getOrderStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-processing';
    }
  }
}
