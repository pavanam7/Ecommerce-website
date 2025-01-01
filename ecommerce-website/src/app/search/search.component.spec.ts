import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchComponent } from './search.component';
import { ProductService } from '../services/product.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductSearchResponse } from '../models/product-search.model';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let productService: jest.Mocked<ProductService>;
  let router: jest.Mocked<Router>;

  const mockProducts: Product[] = [
    {
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
    }
  ];

  const mockSearchResponse: ProductSearchResponse = {
    products: mockProducts,
    total: mockProducts.length,
    page: 1,
    limit: 12
  };

  beforeEach(async () => {
    productService = {
      searchProducts: jest.fn()
    } as any;

    router = {
      navigate: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [SearchComponent, ReactiveFormsModule],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize search form', () => {
    expect(component.searchForm.get('query')).toBeTruthy();
    expect(component.searchForm.get('query')?.value).toBe('');
  });

  it('should not search with empty query', async () => {
    component.searchForm.patchValue({ query: '' });
    await component.onSubmit();
    expect(productService.searchProducts).not.toHaveBeenCalled();
  });

  it('should search with valid query', async () => {
    const searchQuery = 'test product';
    productService.searchProducts.mockReturnValue(of(mockSearchResponse));

    component.searchForm.patchValue({ query: searchQuery });
    await component.onSubmit();

    expect(productService.searchProducts).toHaveBeenCalledWith(searchQuery);
    expect(component.searchResults).toEqual(mockProducts);
    expect(component.loading).toBeFalsy();
    expect(component.errorMessage).toBe('');
  });

  it('should handle search error', async () => {
    const searchQuery = 'test product';
    productService.searchProducts.mockReturnValue(throwError(() => new Error('Search failed')));

    component.searchForm.patchValue({ query: searchQuery });
    await component.onSubmit();

    expect(component.errorMessage).toContain('Failed to search products');
    expect(component.loading).toBeFalsy();
    expect(component.searchResults).toEqual([]);
  });

  it('should navigate to product details', () => {
    const productId = '1';
    component.navigateToProduct(productId);
    expect(router.navigate).toHaveBeenCalledWith(['/products', productId]);
  });
});
