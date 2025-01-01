import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { WishlistComponent } from './wishlist.component';
import { WishlistService } from '../services/wishlist.service';
import { CartService } from '../services/cart.service';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart-item.model';
import { WishlistItem } from '../models/wishlist.model';

describe('WishlistComponent', () => {
  let component: WishlistComponent;
  let fixture: ComponentFixture<WishlistComponent>;
  let wishlistService: jest.Mocked<WishlistService>;
  let cartService: jest.Mocked<CartService>;
  let wishlistItems$: BehaviorSubject<WishlistItem[]>;

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Product 1',
      price: 100,
      description: 'Test 1',
      category: 'Category 1',
      imageUrl: 'test1.jpg',
      mainImage: 'test1.jpg',
      images: ['test1.jpg'],
      specifications: [],
      reviews: [],
      rating: 4.5,
      reviewCount: 10,
      availability: true
    },
    {
      id: '2',
      name: 'Product 2',
      price: 200,
      description: 'Test 2',
      category: 'Category 2',
      imageUrl: 'test2.jpg',
      mainImage: 'test2.jpg',
      images: ['test2.jpg'],
      specifications: [],
      reviews: [],
      rating: 4.0,
      reviewCount: 5,
      availability: true
    }
  ];

  const mockWishlistItems: WishlistItem[] = mockProducts.map(product => ({
    productId: product.id,
    addedAt: new Date().toISOString()
  }));

  beforeEach(async () => {
    wishlistItems$ = new BehaviorSubject<WishlistItem[]>(mockWishlistItems);

    const wishlistServiceMock = {
      getWishlist: jest.fn(),
      addToWishlist: jest.fn(),
      removeFromWishlist: jest.fn(),
      isInWishlist: jest.fn(),
      wishlistItems$: wishlistItems$.asObservable()
    };

    const cartServiceMock = {
      addItem: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [WishlistComponent, CommonModule, HttpClientTestingModule],
      providers: [
        { provide: WishlistService, useValue: wishlistServiceMock },
        { provide: CartService, useValue: cartServiceMock }
      ]
    }).compileComponents();

    wishlistService = TestBed.inject(WishlistService) as jest.Mocked<WishlistService>;
    cartService = TestBed.inject(CartService) as jest.Mocked<CartService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WishlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Wishlist Initialization', () => {
    it('should initialize with wishlist items', () => {
      let items: WishlistItem[] | undefined;
      component.wishlistItems$.subscribe(value => items = value);
      expect(items).toEqual(mockWishlistItems);
    });

    it('should call getWishlist on init', () => {
      component.ngOnInit();
      expect(wishlistService.getWishlist).toHaveBeenCalled();
    });
  });

  describe('Wishlist Operations', () => {
    it('should remove item from wishlist', fakeAsync(() => {
      const productId = mockProducts[0].id;
      wishlistService.removeFromWishlist.mockReturnValue(of(undefined));

      component.removeFromWishlist(productId);
      tick();

      expect(wishlistService.removeFromWishlist).toHaveBeenCalledWith(productId);
    }));

    it('should handle error when removing item fails', fakeAsync(() => {
      const productId = mockProducts[0].id;
      wishlistService.removeFromWishlist.mockReturnValue(throwError(() => new Error('Failed to remove')));
      const consoleSpy = jest.spyOn(console, 'error');

      component.removeFromWishlist(productId);
      tick();

      expect(consoleSpy).toHaveBeenCalled();
    }));

    it('should update wishlist items when removing item', fakeAsync(() => {
      const productId = mockProducts[0].id;
      wishlistService.removeFromWishlist.mockReturnValue(of(undefined));

      component.removeFromWishlist(productId);
      tick();

      // Simulate service updating the BehaviorSubject
      wishlistItems$.next([mockWishlistItems[1]]);

      let items: WishlistItem[] | undefined;
      component.wishlistItems$.subscribe(value => items = value);
      expect(items).toEqual([mockWishlistItems[1]]);
    }));

    it('should add item to cart', () => {
      const product = mockProducts[0];
      const expectedCartItem: CartItem = {
        product: product,
        quantity: 1
      };
      cartService.addItem.mockReturnValue(of(undefined));

      component.addToCart(product);

      expect(cartService.addItem).toHaveBeenCalledWith(expectedCartItem);
    });

    it('should handle error when adding to cart fails', () => {
      const product = mockProducts[0];
      const expectedCartItem: CartItem = {
        product: product,
        quantity: 1
      };
      cartService.addItem.mockReturnValue(throwError(() => new Error('Failed to add')));
      const consoleSpy = jest.spyOn(console, 'error');

      component.addToCart(product);

      expect(consoleSpy).toHaveBeenCalled();
      expect(cartService.addItem).toHaveBeenCalledWith(expectedCartItem);
    });
  });
});
