import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { WishlistService } from '../services/wishlist.service';
import { CartService } from '../services/cart.service';
import { Product } from '../models/product.model';
import { finalize, catchError, takeUntil, retry } from 'rxjs/operators';
import { Observable, EMPTY, Subject, BehaviorSubject } from 'rxjs';
import { WishlistItem } from '../models/wishlist.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit, OnDestroy {
  wishlistItems$: Observable<WishlistItem[]>;
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string>('');
  successMessage$ = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();
  private messageTimeout: number | null = null;
  private readonly MAX_RETRIES = 3;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {
    this.wishlistItems$ = this.wishlistService.wishlistItems$;
  }

  ngOnInit(): void {
    this.loadWishlist();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.messageTimeout) {
      window.clearTimeout(this.messageTimeout);
    }
    this.loading$.complete();
    this.error$.complete();
    this.successMessage$.complete();
  }

  private loadWishlist(): void {
    this.loading$.next(true);
    this.error$.next('');
    this.wishlistService.getWishlist().pipe(
      takeUntil(this.destroy$),
      retry(this.MAX_RETRIES),
      finalize(() => {
        this.loading$.next(false);
        this.cdr.detectChanges();
      }),
      catchError((error: Error) => {
        const errorMessage = 'Failed to load wishlist items. Please try again.';
        this.error$.next(errorMessage);
        console.error('Wishlist loading error:', error);
        return EMPTY;
      })
    ).subscribe({
      next: () => {
        this.showSuccessMessage('Wishlist loaded successfully');
      }
    });
  }

  removeFromWishlist(productId: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!productId) {
      this.error$.next('Invalid product ID');
      return;
    }

    this.loading$.next(true);
    this.error$.next('');
    this.wishlistService.removeFromWishlist(productId).pipe(
      takeUntil(this.destroy$),
      retry(this.MAX_RETRIES),
      finalize(() => {
        this.loading$.next(false);
        this.cdr.detectChanges();
      }),
      catchError((error: Error) => {
        const errorMessage = 'Failed to remove item from wishlist. Please try again.';
        this.error$.next(errorMessage);
        console.error('Remove from wishlist error:', error);
        return EMPTY;
      })
    ).subscribe({
      next: () => {
        this.showSuccessMessage('Item removed from wishlist');
      }
    });
  }

  addToCart(product: Product, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!product?.id) {
      this.error$.next('Invalid product');
      return;
    }

    this.loading$.next(true);
    this.error$.next('');
    const cartItem = {
      product: product,
      quantity: 1
    };

    this.cartService.addItem(cartItem).pipe(
      takeUntil(this.destroy$),
      retry(this.MAX_RETRIES),
      finalize(() => {
        this.loading$.next(false);
        this.cdr.detectChanges();
      }),
      catchError((error: Error) => {
        const errorMessage = 'Failed to add item to cart. Please try again.';
        this.error$.next(errorMessage);
        console.error('Add to cart error:', error);
        return EMPTY;
      })
    ).subscribe({
      next: () => {
        this.showSuccessMessage('Item added to cart');
        this.removeFromWishlist(product.id);
      }
    });
  }

  refreshWishlist(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.loadWishlist();
  }

  private showSuccessMessage(message: string): void {
    this.successMessage$.next(message);
    this.error$.next('');
    if (this.messageTimeout) {
      window.clearTimeout(this.messageTimeout);
    }
    this.messageTimeout = window.setTimeout(() => {
      this.successMessage$.next('');
      this.cdr.detectChanges();
    }, 3000);
  }

  // Getters for template
  get loading(): boolean {
    return this.loading$.value;
  }

  get error(): string {
    return this.error$.value;
  }

  get successMessage(): string {
    return this.successMessage$.value;
  }
}
