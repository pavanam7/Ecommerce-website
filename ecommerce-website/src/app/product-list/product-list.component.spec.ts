import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../services/product.service';
import { WishlistService } from '../services/wishlist.service';
import { CartService } from '../services/cart.service';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductSearchResponse } from '../models/product-search.model';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productService: jest.Mocked<ProductService>;
  let wishlistService: jest.Mocked<WishlistService>;
  let cartService: jest.Mocked<CartService>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    description: 'Test Description',
    imageUrl: 'test.jpg',
    mainImage: 'test.jpg',
    images: ['test.jpg'],
    specifications: [],
    reviews: [],
    rating: 4.5,
    reviewCount: 10,
    availability: true,
    category: 'Test Category'
  };

  const mockSearchResponse: ProductSearchResponse = {
    products: [mockProduct],
    total: 1,
    page: 1,
    limit: 12
  };

  beforeEach(async () => {
    productService = {
      searchProducts: jest.fn(),
      getProduct: jest.fn(),
      getCategories: jest.fn()
    } as any;

    wishlistService = {
      addToWishlist: jest.fn(),
      isInWishlist: jest.fn()
    } as any;

    cartService = {
      addItem: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        FormBuilder,
        { provide: ProductService, useValue: productService },
        { provide: WishlistService, useValue: wishlistService },
        { provide: CartService, useValue: cartService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    productService.searchProducts.mockReturnValue(of(mockSearchResponse));
    productService.getCategories.mockReturnValue(of(['Category 1', 'Category 2']));

    fixture.detectChanges();

    expect(productService.searchProducts).toHaveBeenCalled();
    expect(productService.getCategories).toHaveBeenCalled();
    expect(component.products).toEqual(mockSearchResponse.products);
  });

  it('should handle product search', () => {
    const searchParams = {
      query: 'test',
      page: 1,
      limit: 12
    };

    const emptyResponse: ProductSearchResponse = {
      products: [],
      total: 0,
      page: 1,
      limit: 12
    };

    productService.searchProducts.mockReturnValue(of(emptyResponse));
    component.filterForm.patchValue({ searchQuery: 'test' });
    
    expect(productService.searchProducts).toHaveBeenCalledWith(expect.objectContaining(searchParams));
  });

  it('should add product to cart', () => {
    productService.getProduct.mockReturnValue(of(mockProduct));
    component.addToCart('1');

    expect(productService.getProduct).toHaveBeenCalledWith('1');
    expect(cartService.addItem).toHaveBeenCalledWith({
      product: mockProduct,
      quantity: 1
    });
  });

  it('should add product to wishlist', () => {
    const mockResponse = {
      productId: '1',
      addedAt: new Date().toISOString()
    };

    wishlistService.addToWishlist.mockReturnValue(of(mockResponse));
    component.addToWishlist('1');

    expect(wishlistService.addToWishlist).toHaveBeenCalledWith({ productId: '1' });
  });

  it('should handle pagination', () => {
    const mockResponse: ProductSearchResponse = {
      products: [],
      total: 100,
      page: 2,
      limit: 12
    };

    productService.searchProducts.mockReturnValue(of(mockResponse));
    component.nextPage();

    expect(productService.searchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 })
    );
  });
});