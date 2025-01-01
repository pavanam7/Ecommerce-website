import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  profileForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        zip: ['']
      })
    });

    this.loadProfile();
  }

  async loadProfile() {
    try {
      const user = await this.authService.getCurrentUser();
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address || {}
        });
      }
    } catch (error) {
      console.error('Failed to load profile', error);
    }
  }

  async onSubmit() {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      await this.authService.updateUser(this.profileForm.value);
      this.successMessage = 'Profile updated successfully!';
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to update profile. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
