import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, retry, map } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { CacheService } from './cache.service';
import { environment } from '../../environments/environment';

export interface WishlistItem {
  productId: string;
  addedAt: string;
  product?: Product;
}

export interface WishlistResponse {
  items: WishlistItem[];
  total: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly API_URL = `${environment.apiUrl}/wishlist`;
  private readonly CACHE_TTL = 2 * 60 * 1000; // 2 minutes
  private readonly MAX_RETRIES = 3;
  private wishlistItems = new BehaviorSubject<WishlistItem[]>([]);

  wishlistItems$ = this.wishlistItems.asObservable();

  constructor(
    private http: HttpClient,
    private cache: CacheService
  ) {
    this.loadWishlist().subscribe();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.status === 0 
        ? 'Unable to connect to server' 
        : `Server error: ${error.status}`;
    }
    console.error('Wishlist error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  private loadWishlist(): Observable<WishlistItem[]> {
    const cacheKey = 'wishlist:items';
    const cached = this.cache.get<WishlistItem[]>(cacheKey);

    if (cached) {
      this.wishlistItems.next(cached);
      return of(cached);
    }

    return this.http.get<WishlistResponse>(this.API_URL).pipe(
      retry(this.MAX_RETRIES),
      map(response => response.items),
      tap((items) => {
        if (items) {
          this.cache.set(cacheKey, items, this.CACHE_TTL);
          this.wishlistItems.next(items);
        }
      }),
      catchError((error) => {
        console.error('Error loading wishlist:', error);
        this.wishlistItems.next([]);
        return this.handleError(error);
      })
    );
  }

  getWishlist(): Observable<WishlistItem[]> {
    return this.loadWishlist();
  }

  addToWishlist(item: { productId: string }): Observable<WishlistItem> {
    if (!item.productId) {
      return throwError(() => new Error('Product ID is required'));
    }

    return this.http.post<WishlistItem>(this.API_URL, item).pipe(
      retry(this.MAX_RETRIES),
      tap((newItem) => {
        const currentItems = this.wishlistItems.value;
        if (!currentItems.some(i => i.productId === newItem.productId)) {
          this.wishlistItems.next([...currentItems, newItem]);
          this.clearWishlistCache();
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  removeFromWishlist(productId: string): Observable<void> {
    if (!productId) {
      return throwError(() => new Error('Product ID is required'));
    }

    return this.http.delete<void>(`${this.API_URL}/${productId}`).pipe(
      retry(this.MAX_RETRIES),
      tap(() => {
        const currentItems = this.wishlistItems.value;
        this.wishlistItems.next(
          currentItems.filter(item => item.productId !== productId)
        );
        this.clearWishlistCache();
      }),
      catchError(this.handleError.bind(this))
    );
  }

  isInWishlist(productId: string): boolean {
    if (!productId) return false;
    return this.wishlistItems.value.some(item => item.productId === productId);
  }

  getWishlistCount(): number {
    return this.wishlistItems.value.length;
  }

  clearWishlist(): Observable<void> {
    return this.http.delete<void>(this.API_URL).pipe(
      retry(this.MAX_RETRIES),
      tap(() => {
        this.wishlistItems.next([]);
        this.clearWishlistCache();
      }),
      catchError(this.handleError.bind(this))
    );
  }

  refreshWishlist(): Observable<WishlistItem[]> {
    this.clearWishlistCache();
    return this.loadWishlist();
  }

  private clearWishlistCache(): void {
    this.cache.clear('wishlist:items');
  }
}
