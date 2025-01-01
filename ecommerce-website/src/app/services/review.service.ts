import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id?: string;
  rating: number;
  text: string;
  date: Date;
  userName?: string;
  userId?: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  constructor(private http: HttpClient) {}

  getReviews(page: number, limit: number): Observable<ReviewsResponse> {
    return this.http.get<ReviewsResponse>('/api/reviews', {
      params: {
        page: page.toString(),
        limit: limit.toString()
      }
    });
  }

  submitReview(review: Review): Observable<Review> {
    return this.http.post<Review>('/api/reviews', review);
  }

  getProductReviews(productId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`/api/products/${productId}/reviews`);
  }
}
