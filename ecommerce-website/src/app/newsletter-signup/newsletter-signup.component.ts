import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsletterService } from '../services/newsletter.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-newsletter-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './newsletter-signup.component.html',
  styleUrls: ['./newsletter-signup.component.scss']
})
export class NewsletterSignupComponent {
  newsletterForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private newsletterService: NewsletterService
  ) {
    this.newsletterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.newsletterForm.invalid) {
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const email = this.newsletterForm.value.email;

    this.newsletterService.subscribe(email).subscribe({
      next: () => {
        this.successMessage = 'Thank you for subscribing!';
        this.newsletterForm.reset();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to subscribe. Please try again.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
