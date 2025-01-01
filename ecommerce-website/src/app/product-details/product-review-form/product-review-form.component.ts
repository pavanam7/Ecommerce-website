import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-product-review-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './product-review-form.component.html',
  styleUrls: ['./product-review-form.component.scss']
})
export class ProductReviewFormComponent {
  @Output() reviewSubmitted = new EventEmitter<void>();

  reviewForm: any;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService
  ) {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      text: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.reviewForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const review = {
      rating: this.reviewForm.value.rating!,
      text: this.reviewForm.value.text!,
      date: new Date()
    };

    this.reviewService.submitReview(review).subscribe({
      next: () => {
        this.successMessage = 'Thank you for your review!';
        this.reviewForm.reset();
        this.reviewSubmitted.emit();
      },
      error: (err) => {
        this.errorMessage = 'Failed to submit review. Please try again.';
        console.error('Review submission error:', err);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  get rating() {
    return this.reviewForm.get('rating');
  }

  get text() {
    return this.reviewForm.get('text');
  }
}
