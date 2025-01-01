import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService, ProductSearchParams, ProductSearchResponse } from '../services/product.service';
import { WishlistService } from '../services/wishlist.service';
import { CartService } from '../services/cart.service';
import { Product } from '../models/product.model';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductCardSkeletonComponent } from '../shared/components/product-card-skeleton/product-card-skeleton.component';
import { SkeletonLoaderComponent } from '../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ProductCardSkeletonComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  errorMessage: string | null = null;
  isLoading = false;
  isFiltersLoading = false;
  viewMode: 'grid' | 'list' = 'grid';
  
  // Search and Filter State
  searchQuery = '';
  selectedCategory = '';
  selectedSort = 'price-asc';
  maxPrice = 1000;
  
  // Available Filter Options
  availableFilters: {
    categories: string[];
    priceRange: { min: number; max: number };
  } = {
    categories: [],
    priceRange: { min: 0, max: 1000 }
  };
  
  // Sorting options
  sortOptions = [
    { field: 'price', direction: 'asc', label: 'Price: Low to High' },
    { field: 'price', direction: 'desc', label: 'Price: High to Low' },
    { field: 'name', direction: 'asc', label: 'Name: A to Z' },
    { field: 'name', direction: 'desc', label: 'Name: Z to A' },
    { field: 'rating', direction: 'desc', label: 'Highest Rated' }
  ];
  
  // Pagination
  pagination = {
    page: 1,
    limit: 12
  };
  totalItems = 0;
  totalPages = 1;
  
  // Product Comparison
  selectedForComparison: Set<string> = new Set();
  maxCompareItems = 4;
  
  private destroy$ = new Subject<void>();
  private searchDebounce$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    public wishlistService: WishlistService,
    private cartService: CartService,
    private fb: FormBuilder
  ) {
    this.initializeFilterForm();
  }

  ngOnInit(): void {
    this.loadFilterOptions();
    this.setupSearchDebounce();
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      searchQuery: [''],
      category: [''],
      minPrice: [0],
      maxPrice: [1000],
      minRating: [0],
      inStock: [false]
    });

    // Subscribe to form changes
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => this.searchDebounce$.next());
  }

  private setupSearchDebounce(): void {
    this.searchDebounce$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300)
      )
      .subscribe(() => this.loadProducts());
  }

  // Filter Form with definite assignment assertion
  filterForm!: FormGroup;

  loadProducts(retryCount = 0): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    // Set loading timeout
    const loadingTimeout = setTimeout(() => {
      if (this.isLoading) {
        this.errorMessage = 'Taking longer than expected. Please wait...';
      }
    }, 3000);
    
    const formValues = this.filterForm.value;
    const searchParams: ProductSearchParams = {
      query: formValues.searchQuery,
      category: formValues.category,
      minPrice: Number(formValues.minPrice),
      maxPrice: Number(formValues.maxPrice),
      page: this.pagination.page,
      limit: this.pagination.limit,
      sortBy: 'price',
      sortOrder: 'asc'
    };

    this.productService.searchProducts(searchParams).subscribe({
      next: (response: ProductSearchResponse) => {
        clearTimeout(loadingTimeout);
        this.products = response.products;
        this.totalItems = response.total;
        this.totalPages = Math.ceil(response.total / response.limit);
        this.pagination.page = response.page;
      },
      error: (error: Error) => {
        clearTimeout(loadingTimeout);
        if (retryCount < 3) {
          setTimeout(() => {
            this.loadProducts(retryCount + 1);
          }, 1000 * (retryCount + 1));
          this.errorMessage = `Connection issue. Retrying... (${retryCount + 1}/3)`;
        } else {
          this.errorMessage = 'Failed to load products. Please check your connection and try again.';
          console.error('Error fetching products:', error);
        }
      },
      complete: () => {
        clearTimeout(loadingTimeout);
        this.isLoading = false;
      }
    });
  }

  private loadFilterOptions(): void {
    this.isFiltersLoading = true;
    this.productService.getCategories().subscribe({
      next: (categories: string[]) => {
        this.availableFilters.categories = categories;
      },
      error: (error: Error) => {
        console.error('Error loading filters:', error);
        this.errorMessage = 'Failed to load filter options';
      },
      complete: () => {
        this.isFiltersLoading = false;
      }
    });
  }

  addToCart(productId: string): void {
    this.productService.getProduct(productId).subscribe({
      next: (product: Product) => {
        this.cartService.addItem({
          product: product,
          quantity: 1
        });
      },
      error: (error: Error) => console.error('Error adding product to cart', error)
    });
  }

  addToWishlist(productId: string): void {
    this.wishlistService.addToWishlist({ productId }).subscribe({
      next: () => {
        // Handle success (maybe show a toast)
      },
      error: (error: Error) => console.error('Error adding to wishlist', error)
    });
  }

  toggleCompare(productId: string): void {
    if (this.selectedForComparison.has(productId)) {
      this.selectedForComparison.delete(productId);
    } else if (this.selectedForComparison.size < this.maxCompareItems) {
      this.selectedForComparison.add(productId);
    }
  }

  nextPage(): void {
    if (this.pagination.page < this.totalPages) {
      this.pagination.page++;
      this.loadProducts();
    }
  }

  previousPage(): void {
    if (this.pagination.page > 1) {
      this.pagination.page--;
      this.loadProducts();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pagination.page = page;
      this.loadProducts();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.pagination.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
