import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();

  constructor() {
    // Clean up expired cache entries periodically
    setInterval(() => this.cleanExpiredEntries(), 60000); // Every minute
  }

  set<T>(key: string, data: T, ttl: number): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  observe<T>(key: string, request: Observable<T>, ttl: number): Observable<T> {
    const cached = this.get<T>(key);
    if (cached) {
      return of(cached);
    }

    return request.pipe(
      tap(data => this.set(key, data, ttl))
    );
  }

  clear(key: string): void {
    this.cache.delete(key);
  }

  clearAll(): void {
    this.cache.clear();
  }

  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.cache.delete(key);
      }
    }
  }
} 