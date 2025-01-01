import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, SocialProvider } from '../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnDestroy {
  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeForm();
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginForm.patchValue({ email: rememberedEmail });
    }
  }

  private initializeForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      const { email, password, rememberMe } = this.loginForm.value;
      
      this.authService.login(email, password)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            if (rememberMe) {
              localStorage.setItem('rememberedEmail', email);
            } else {
              localStorage.removeItem('rememberedEmail');
            }
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.errorMessage = err.message || 'Login failed. Please try again.';
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
          }
        });
    }
  }

  socialLogin(provider: SocialProvider) {
    if (!this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      // In a real implementation, we would first get the token from the social provider's SDK
      // For now, we'll simulate it with a mock token
      const mockToken = 'mock-social-token';

      this.authService.socialLogin(provider, mockToken)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.errorMessage = `Social login failed: ${err.message}`;
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
          }
        });
    }
  }

  requestPasswordReset() {
    const email = this.loginForm.get('email')?.value;
    if (email && this.loginForm.get('email')?.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.requestPasswordReset(email)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.errorMessage = 'Password reset instructions have been sent to your email.';
            this.isLoading = false;
          },
          error: (err) => {
            this.errorMessage = err.message || 'Failed to send reset instructions. Please try again.';
            this.isLoading = false;
          }
        });
    } else {
      this.errorMessage = 'Please enter a valid email address to reset your password.';
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
