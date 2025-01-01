import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartItems$ = new BehaviorSubject<CartItem[]>([]);

  constructor(private http: HttpClient) {
    this.loadCart();
  }

  private loadCart(): void {
    this.http.get<CartItem[]>(this.apiUrl).subscribe(
      items => this.cartItems$.next(items),
      error => console.error('Error loading cart:', error)
    );
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems$.asObservable();
  }

  setCartItems(items: CartItem[]): Observable<void> {
    return new Observable<void>(observer => {
      this.http.post<void>(`${this.apiUrl}/set`, items).subscribe(
        () => {
          this.cartItems$.next(items);
          observer.next();
          observer.complete();
        },
        error => {
          console.error('Error setting cart items:', error);
          observer.error(error);
        }
      );
    });
  }

  addItem(item: CartItem): Observable<void> {
    return new Observable<void>(observer => {
      this.http.post<void>(`${this.apiUrl}/add`, item).subscribe(
        () => {
          const currentItems = this.cartItems$.value;
          const existingItem = currentItems.find(i => i.product.id === item.product.id);
          if (existingItem) {
            existingItem.quantity += item.quantity;
            this.cartItems$.next([...currentItems]);
          } else {
            this.cartItems$.next([...currentItems, item]);
          }
          observer.next();
          observer.complete();
        },
        error => {
          console.error('Error adding item to cart:', error);
          observer.error(error);
        }
      );
    });
  }

  updateItem(item: CartItem): Observable<void> {
    return new Observable<void>(observer => {
      this.http.put<void>(`${this.apiUrl}/update`, item).subscribe(
        () => {
          const currentItems = this.cartItems$.value;
          const index = currentItems.findIndex(i => i.product.id === item.product.id);
          if (index !== -1) {
            currentItems[index] = item;
            this.cartItems$.next([...currentItems]);
          }
          observer.next();
          observer.complete();
        },
        error => {
          console.error('Error updating cart item:', error);
          observer.error(error);
        }
      );
    });
  }

  removeItem(item: CartItem): Observable<void> {
    return new Observable<void>(observer => {
      this.http.delete<void>(`${this.apiUrl}/remove/${item.product.id}`).subscribe(
        () => {
          const currentItems = this.cartItems$.value;
          const updatedItems = currentItems.filter(i => i.product.id !== item.product.id);
          this.cartItems$.next(updatedItems);
          observer.next();
          observer.complete();
        },
        error => {
          console.error('Error removing item from cart:', error);
          observer.error(error);
        }
      );
    });
  }

  clearCart(): Observable<void> {
    return new Observable<void>(observer => {
      this.http.delete<void>(`${this.apiUrl}/clear`).subscribe(
        () => {
          this.cartItems$.next([]);
          observer.next();
          observer.complete();
        },
        error => {
          console.error('Error clearing cart:', error);
          observer.error(error);
        }
      );
    });
  }

  calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }
}
