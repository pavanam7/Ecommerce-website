import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private apiUrl = `${environment.apiUrl}/faqs`;

  constructor(private http: HttpClient) {}

  getFaqs(): Observable<FaqItem[]> {
    return this.http.get<FaqItem[]>(this.apiUrl);
  }
} 