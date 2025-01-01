import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  discountPercentage?: number;
  validUntil?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private apiUrl = '/api/promotions';

  constructor(private http: HttpClient) {}

  getActivePromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.apiUrl}/active`);
  }

  getPromotionById(id: string): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.apiUrl}/${id}`);
  }
}
