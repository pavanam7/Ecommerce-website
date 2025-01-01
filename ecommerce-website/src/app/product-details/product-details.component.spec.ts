import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDetailsComponent } from './product-details.component';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Product } from '../models/product.model';
import { WishlistItem } from '../models/wishlist.model';

describe('ProductDetailsComponent', () => {
  let component: ProductDetailsComponent;
  let fixture: ComponentFixture<ProductDetailsComponent>;
  let productService: jest.Mocked<ProductService>;
  let cartService: jest.Mocked<CartService>;
  let wishlistService: jest.Mocked<WishlistService>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    description: 'Test Description',
    category: 'Test Category',
    imageUrl: 'test.jpg',
    mainImage: 'test.jpg',
    images: ['test.jpg'],
    specifications: [
      { name: 'Brand', value: 'Test Brand' },
      { name: 'Material', value: 'Test Material' }
    ],
    reviews: [],
    rating: 4.5,
    reviewCount: 10,
    availability: true
  };

  const mockRelatedProducts: Product[] = [
    {
      id: '2',
      name: 'Related Product',
      price: 79.99,
      description: 'Related Description',
      category: 'Test Category',
      imageUrl: 'related.jpg',
      mainImage: 'related.jpg',
      images: ['related.jpg'],
      specifications: [],
      reviews: [],
      rating: 4.0,
      reviewCount: 5,
      availability: true
    }
  ];

  beforeEach(async () => {
    productService = {
      getProduct: jest.fn(),
      getRelatedProducts: jest.fn(),
      getCategories: jest.fn()
    } as any;

    cartService = {
      addItem: jest.fn()
    } as any;

    wishlistService = {
      addToWishlist: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [ProductDetailsComponent],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: CartService, useValue: cartService },
        { provide: WishlistService, useValue: wishlistService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load product details on init', () => {
    productService.getProduct.mockReturnValue(of(mockProduct));
    productService.getRelatedProducts.mockReturnValue(of(mockRelatedProducts));

    fixture.detectChanges();

    expect(productService.getProduct).toHaveBeenCalledWith('1');
    expect(component.product).toEqual(mockProduct);
    expect(component.relatedProducts).toEqual(mockRelatedProducts);
  });

  it('should add product to cart', () => {
    component.product = mockProduct;
    component.addToCart();

    expect(cartService.addItem).toHaveBeenCalledWith({
      product: mockProduct,
      quantity: 1
    });
  });

  it('should add product to wishlist', () => {
    const mockWishlistResponse: WishlistItem = {
      productId: mockProduct.id,
      addedAt: new Date().toISOString()
    };

    component.product = mockProduct;
    wishlistService.addToWishlist.mockReturnValue(of(mockWishlistResponse));

    component.addToWishlist();

    expect(wishlistService.addToWishlist).toHaveBeenCalledWith({
      productId: mockProduct.id
    });
  });

  it('should select image', () => {
    const imageUrl = 'test.jpg';
    component.selectImage(imageUrl);
    expect(component.selectedImage).toBe(imageUrl);
  });

  it('should toggle specifications', () => {
    expect(component.showSpecs).toBeFalsy();
    component.toggleSpecs();
    expect(component.showSpecs).toBeTruthy();
  });

  it('should toggle reviews', () => {
    expect(component.showReviews).toBeFalsy();
    component.toggleReviews();
    expect(component.showReviews).toBeTruthy();
  });
});