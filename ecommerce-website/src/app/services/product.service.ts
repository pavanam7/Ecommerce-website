import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { CacheService } from './cache.service';
import { environment } from '../../environments/environment';

export interface ProductSearchResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductSearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = `${environment.apiUrl}/products`;
  private readonly CACHE_TTL = {
    PRODUCT: 5 * 60 * 1000,      // 5 minutes
    SEARCH: 2 * 60 * 1000,       // 2 minutes
    CATEGORIES: 10 * 60 * 1000,  // 10 minutes
    RELATED: 5 * 60 * 1000       // 5 minutes
  };

  constructor(
    private http: HttpClient,
    private cache: CacheService
  ) {}

  getProduct(id: string): Observable<Product> {
    const cacheKey = `product:${id}`;
    return this.cache.observe<Product>(
      cacheKey,
      this.http.get<Product>(`${this.API_URL}/${id}`),
      this.CACHE_TTL.PRODUCT
    );
  }

  searchProducts(params: ProductSearchParams): Observable<ProductSearchResponse> {
    const httpParams = this.buildSearchParams(params);
    const cacheKey = `products:search:${httpParams.toString()}`;
    
    return this.cache.observe<ProductSearchResponse>(
      cacheKey,
      this.http.get<ProductSearchResponse>(this.API_URL, { params: httpParams }),
      this.CACHE_TTL.SEARCH
    );
  }

  getCategories(): Observable<string[]> {
    const cacheKey = 'products:categories';
    return this.cache.observe<string[]>(
      cacheKey,
      this.http.get<string[]>(`${this.API_URL}/categories`),
      this.CACHE_TTL.CATEGORIES
    );
  }

  getRelatedProducts(productId: string, limit: number = 4): Observable<Product[]> {
    const cacheKey = `products:related:${productId}:${limit}`;
    return this.cache.observe<Product[]>(
      cacheKey,
      this.http.get<Product[]>(`${this.API_URL}/${productId}/related`, {
        params: { limit: limit.toString() }
      }),
      this.CACHE_TTL.RELATED
    );
  }

  getProductsByCategory(category: string, limit: number = 8): Observable<Product[]> {
    const cacheKey = `products:category:${category}:${limit}`;
    return this.cache.observe<Product[]>(
      cacheKey,
      this.http.get<Product[]>(`${this.API_URL}/category/${category}`, {
        params: { limit: limit.toString() }
      }),
      this.CACHE_TTL.SEARCH
    );
  }

  private buildSearchParams(params: ProductSearchParams): HttpParams {
    let httpParams = new HttpParams();

    if (params.query) {
      httpParams = httpParams.set('query', params.query);
    }
    if (params.category) {
      httpParams = httpParams.set('category', params.category);
    }
    if (params.minPrice !== undefined) {
      httpParams = httpParams.set('minPrice', params.minPrice.toString());
    }
    if (params.maxPrice !== undefined) {
      httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      httpParams = httpParams.set('sortOrder', params.sortOrder);
    }
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return httpParams;
  }
}
