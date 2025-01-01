import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { DatePipe } from '@angular/common';
import { ReviewService } from '../services/review.service';

interface Review {
  id?: string;
  rating: number;
  text: string;
  date: Date;
  userName?: string;
  userId?: string;
}

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    DatePipe
  ],
  templateUrl: './product-reviews.component.html',
  styleUrls: ['./product-reviews.component.scss']
})
export class ProductReviewsComponent {
  reviews: Review[] = [];
  reviewForm: FormGroup;
  loading = false;
  errorMessage = '';
  currentPage = 1;
  itemsPerPage = 5;
  totalReviews = 0;
  averageRating = 0;

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService
  ) {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      text: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.loadReviews();
  }

  async loadReviews() {
    try {
      this.loading = true;
      const response = await this.reviewService.getReviews(this.currentPage, this.itemsPerPage).toPromise();
      if (response) {
        this.reviews = response.reviews;
        this.totalReviews = response.total;
      } else {
        throw new Error('Failed to load reviews');
      }
      this.calculateAverageRating();
    } catch (error) {
      this.errorMessage = 'Failed to load reviews. Please try again later.';
    } finally {
      this.loading = false;
    }
  }

  async submitReview() {
    if (this.reviewForm.invalid) {
      return;
    }

    try {
      this.loading = true;
      const review = this.reviewForm.value;
      await this.reviewService.submitReview(review);
      this.reviewForm.reset();
      this.loadReviews();
    } catch (error) {
      this.errorMessage = 'Failed to submit review. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  calculateAverageRating() {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      return;
    }

    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = Math.round((total / this.reviews.length) * 10) / 10;
  }

  getRatingStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  getRatingClass(rating: number, star: number): string {
    return star <= rating ? 'filled' : '';
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadReviews();
  }

  get totalPages(): number {
    return Math.ceil(this.totalReviews / this.itemsPerPage);
  }
}
