import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService, AuthResponse } from '../services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;

  const mockAuthResponse: AuthResponse = {
    token: 'test-token',
    refreshToken: 'test-refresh-token',
    expiresIn: 3600
  };

  beforeEach(async () => {
    const authServiceMock = {
      register: jest.fn()
    };

    const routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.registerForm.get('name')?.value).toBe('');
      expect(component.registerForm.get('email')?.value).toBe('');
      expect(component.registerForm.get('password')?.value).toBe('');
      expect(component.registerForm.get('confirmPassword')?.value).toBe('');
    });

    it('should initialize form with required validators', () => {
      const form = component.registerForm;
      expect(form.get('name')?.errors?.['required']).toBeTruthy();
      expect(form.get('email')?.errors?.['required']).toBeTruthy();
      expect(form.get('password')?.errors?.['required']).toBeTruthy();
      expect(form.get('confirmPassword')?.errors?.['required']).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.errors?.['email']).toBeTruthy();

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.errors).toBeNull();
    });

    it('should validate password length', () => {
      const passwordControl = component.registerForm.get('password');
      passwordControl?.setValue('12345');
      expect(passwordControl?.errors?.['minlength']).toBeTruthy();

      passwordControl?.setValue('123456');
      expect(passwordControl?.errors).toBeNull();
    });

    it('should validate password match', () => {
      const form = component.registerForm;
      form.patchValue({
        password: '123456',
        confirmPassword: '123457'
      });
      expect(form.errors?.['mismatch']).toBeTruthy();

      form.patchValue({
        password: '123456',
        confirmPassword: '123456'
      });
      expect(form.errors).toBeNull();
    });
  });

  describe('Registration Process', () => {
    const validForm = {
      name: 'Test User',
      email: 'test@example.com',
      password: '123456',
      confirmPassword: '123456'
    };

    it('should not submit if form is invalid', () => {
      component.onSubmit();
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should submit valid registration and navigate to login', fakeAsync(() => {
      authService.register.mockReturnValue(of(mockAuthResponse));
      
      component.registerForm.patchValue(validForm);
      component.onSubmit();
      tick();

      expect(authService.register).toHaveBeenCalledWith(
        validForm.name,
        validForm.email,
        validForm.password
      );
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(component.errorMessage).toBe('');
    }));

    it('should handle registration error', fakeAsync(() => {
      const errorMessage = 'Email already exists';
      authService.register.mockReturnValue(throwError(() => ({
        error: { message: errorMessage }
      })));

      component.registerForm.patchValue(validForm);
      component.onSubmit();
      tick();

      expect(component.errorMessage).toBe(errorMessage);
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should handle registration error with default message', fakeAsync(() => {
      authService.register.mockReturnValue(throwError(() => ({
        error: {}
      })));

      component.registerForm.patchValue(validForm);
      component.onSubmit();
      tick();

      expect(component.errorMessage).toBe('Registration failed. Please try again.');
      expect(router.navigate).not.toHaveBeenCalled();
    }));
  });
});
