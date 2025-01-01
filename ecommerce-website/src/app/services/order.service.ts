import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { environment } from '../../environments/environment';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = `${environment.apiUrl}/orders`;
  private readonly CACHE_TTL = {
    ORDER: 30 * 1000,        // 30 seconds
    ORDER_HISTORY: 60 * 1000 // 1 minute
  };

  constructor(
    private http: HttpClient,
    private cache: CacheService
  ) {}

  createOrder(order: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.API_URL, order).pipe(
      tap(() => this.clearOrderCache())
    );
  }

  getOrderDetails(orderId: string, email: string): Observable<Order> {
    const cacheKey = `order:${orderId}:${email}`;
    return this.cache.observe<Order>(
      cacheKey,
      this.http.get<Order>(`${this.API_URL}/${orderId}`, {
        params: { email }
      }),
      this.CACHE_TTL.ORDER
    );
  }

  getOrderHistory(userId: string): Observable<Order[]> {
    const cacheKey = `orders:user:${userId}`;
    return this.cache.observe<Order[]>(
      cacheKey,
      this.http.get<Order[]>(`${this.API_URL}/user/${userId}`),
      this.CACHE_TTL.ORDER_HISTORY
    );
  }

  updateOrderStatus(orderId: string, status: Order['status']): Observable<Order> {
    return this.http.patch<Order>(`${this.API_URL}/${orderId}/status`, { status }).pipe(
      tap(() => {
        // Clear both specific order cache and order history cache
        this.clearOrderCache(orderId);
        this.clearOrderHistoryCache();
      })
    );
  }

  cancelOrder(orderId: string): Observable<Order> {
    return this.http.post<Order>(`${this.API_URL}/${orderId}/cancel`, {}).pipe(
      tap(() => {
        this.clearOrderCache(orderId);
        this.clearOrderHistoryCache();
      })
    );
  }

  getOrderTracking(orderId: string): Observable<{
    status: Order['status'];
    trackingNumber?: string;
    estimatedDelivery?: string;
    events: Array<{
      status: string;
      location: string;
      timestamp: string;
      description: string;
    }>;
  }> {
    const cacheKey = `order:tracking:${orderId}`;
    return this.cache.observe(
      cacheKey,
      this.http.get<any>(`${this.API_URL}/${orderId}/tracking`),
      this.CACHE_TTL.ORDER
    );
  }

  private clearOrderCache(orderId?: string): void {
    if (orderId) {
      const keys = this.cache.getKeys();
      keys.forEach(key => {
        if (key.includes(`order:${orderId}`)) {
          this.cache.clear(key);
        }
      });
    } else {
      this.clearAllOrderCache();
    }
  }

  private clearOrderHistoryCache(): void {
    const keys = this.cache.getKeys();
    keys.forEach(key => {
      if (key.startsWith('orders:user:')) {
        this.cache.clear(key);
      }
    });
  }

  private clearAllOrderCache(): void {
    const keys = this.cache.getKeys();
    keys.forEach(key => {
      if (key.startsWith('order:') || key.startsWith('orders:')) {
        this.cache.clear(key);
      }
    });
  }
}
