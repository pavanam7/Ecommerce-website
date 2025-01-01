import { Component, OnInit, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FaqItemWithState extends FaqItem {
  isExpanded: boolean;
}

@Injectable({
  providedIn: 'root'
})
class FaqService {
  constructor(private http: HttpClient) {}

  getFaqs(): Observable<FaqItem[]> {
    return this.http.get<FaqItem[]>(`${environment.apiUrl}/faqs`);
  }
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="faq-container">
      <h1>Frequently Asked Questions</h1>
      
      <div class="search-container">
        <input 
          type="text" 
          [(ngModel)]="searchQuery" 
          (ngModelChange)="filterFaqs()"
          placeholder="Search FAQs..."
          class="search-input"
        >
      </div>

      <div class="faq-categories">
        <button 
          *ngFor="let cat of categories"
          (click)="selectCategory(cat)"
          [class.active]="selectedCategory === cat"
          class="category-btn"
        >
          {{cat}}
        </button>
      </div>

      <div class="faq-list">
        <div *ngFor="let faq of filteredFaqs" class="faq-item">
          <div 
            class="faq-question" 
            (click)="toggleFaq(faq)"
            [class.expanded]="faq.isExpanded"
          >
            <span>{{faq.question}}</span>
            <i class="arrow" [class.down]="!faq.isExpanded" [class.up]="faq.isExpanded"></i>
          </div>
          <div class="faq-answer" *ngIf="faq.isExpanded">
            {{faq.answer}}
          </div>
        </div>
      </div>

      <div *ngIf="filteredFaqs.length === 0" class="no-results">
        No FAQs found matching your search.
      </div>
    </div>
  `,
  styles: [`
    .faq-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    h1 {
      text-align: center;
      margin-bottom: 30px;
    }

    .search-container {
      margin-bottom: 20px;
    }

    .search-input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 16px;
    }

    .faq-categories {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .category-btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 20px;
      background: none;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .category-btn.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .faq-item {
      margin-bottom: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }

    .faq-question {
      padding: 15px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
    }

    .faq-question.expanded {
      border-bottom: 1px solid #ddd;
    }

    .faq-answer {
      padding: 15px;
      background: #f9f9f9;
    }

    .arrow {
      border: solid #666;
      border-width: 0 2px 2px 0;
      display: inline-block;
      padding: 3px;
      transition: transform 0.3s ease;
    }

    .down {
      transform: rotate(45deg);
    }

    .up {
      transform: rotate(-135deg);
    }

    .no-results {
      text-align: center;
      padding: 20px;
      color: #666;
    }
  `]
})
export class FaqComponent implements OnInit {
  faqs: FaqItemWithState[] = [];
  filteredFaqs: FaqItemWithState[] = [];
  categories: string[] = [];
  searchQuery: string = '';
  selectedCategory: string = 'All';

  constructor(private faqService: FaqService) {}

  ngOnInit() {
    this.loadFaqs();
  }

  private loadFaqs() {
    this.faqService.getFaqs().subscribe({
      next: (faqs: FaqItem[]) => {
        this.faqs = faqs.map(faq => ({ ...faq, isExpanded: false }));
        this.filteredFaqs = this.faqs;
        this.categories = ['All', ...new Set(faqs.map(faq => faq.category))];
      },
      error: (error: Error) => {
        console.error('Error loading FAQs:', error);
      }
    });
  }

  filterFaqs() {
    this.filteredFaqs = this.faqs.filter(faq => {
      const matchesSearch = !this.searchQuery || 
        faq.question.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesCategory = this.selectedCategory === 'All' || 
        faq.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.filterFaqs();
  }

  toggleFaq(faq: FaqItemWithState) {
    faq.isExpanded = !faq.isExpanded;
  }
}
