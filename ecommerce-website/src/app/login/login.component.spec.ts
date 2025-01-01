import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService, SocialProvider } from '../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    const authServiceMock = {
      login: jest.fn(),
      socialLogin: jest.fn(),
      requestPasswordReset: jest.fn()
    };

    const routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: 'register', component: {} as any }
        ])
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.loginForm.get('email')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
      expect(component.loginForm.get('rememberMe')?.value).toBe(false);
    });

    it('should load remembered email if exists', () => {
      const rememberedEmail = 'test@example.com';
      localStorage.setItem('rememberedEmail', rememberedEmail);
      
      // Re-create component to trigger constructor
      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.loginForm.get('email')?.value).toBe(rememberedEmail);
      
      // Cleanup
      localStorage.removeItem('rememberedEmail');
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      const form = component.loginForm;
      expect(form.valid).toBeFalsy();
      expect(form.get('email')?.errors?.['required']).toBeTruthy();
      expect(form.get('password')?.errors?.['required']).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.errors?.['email']).toBeTruthy();

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.errors).toBeNull();
    });

    it('should validate password length', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('short');
      expect(passwordControl?.errors?.['minlength']).toBeTruthy();

      passwordControl?.setValue('validpassword');
      expect(passwordControl?.errors).toBeNull();
    });
  });

  describe('Login Process', () => {
    it('should not submit if form is invalid', () => {
      component.onSubmit();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should submit valid credentials and navigate on success', fakeAsync(() => {
      const credentials = {
        email: 'test@example.com',
        password: 'validpassword',
        rememberMe: true
      };

      authService.login.mockReturnValue(of({
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        expiresIn: 3600
      }));
      
      component.loginForm.patchValue(credentials);
      component.onSubmit();
      tick();

      expect(authService.login).toHaveBeenCalledWith(credentials.email, credentials.password);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(localStorage.getItem('rememberedEmail')).toBe(credentials.email);

      // Cleanup
      localStorage.removeItem('rememberedEmail');
    }));

    it('should handle login error', fakeAsync(() => {
      const errorMessage = 'Invalid credentials';
      authService.login.mockReturnValue(throwError(() => new Error(errorMessage)));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'validpassword'
      });
      component.onSubmit();
      tick();

      expect(component.errorMessage).toBe(errorMessage);
      expect(component.isLoading).toBeFalsy();
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should not remember email if rememberMe is false', fakeAsync(() => {
      const credentials = {
        email: 'test@example.com',
        password: 'validpassword',
        rememberMe: false
      };

      authService.login.mockReturnValue(of({
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        expiresIn: 3600
      }));
      
      component.loginForm.patchValue(credentials);
      component.onSubmit();
      tick();

      expect(localStorage.getItem('rememberedEmail')).toBeNull();
    }));
  });

  describe('Social Login', () => {
    it('should handle social login success', fakeAsync(() => {
      authService.socialLogin.mockReturnValue(of({
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        expiresIn: 3600
      }));

      component.socialLogin('google' as SocialProvider);
      tick();

      expect(authService.socialLogin).toHaveBeenCalledWith('google', expect.any(String));
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(component.isLoading).toBeFalsy();
    }));

    it('should handle social login error', fakeAsync(() => {
      const errorMessage = 'Social login failed';
      authService.socialLogin.mockReturnValue(throwError(() => new Error(errorMessage)));

      component.socialLogin('facebook' as SocialProvider);
      tick();

      expect(component.errorMessage).toContain(errorMessage);
      expect(component.isLoading).toBeFalsy();
      expect(router.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('Password Reset', () => {
    it('should not request password reset with invalid email', () => {
      component.loginForm.patchValue({ email: 'invalid-email' });
      component.requestPasswordReset();

      expect(authService.requestPasswordReset).not.toHaveBeenCalled();
      expect(component.errorMessage).toContain('valid email');
    });

    it('should handle password reset request success', fakeAsync(() => {
      const email = 'test@example.com';
      authService.requestPasswordReset.mockReturnValue(of(undefined));

      component.loginForm.patchValue({ email });
      component.requestPasswordReset();
      tick();

      expect(authService.requestPasswordReset).toHaveBeenCalledWith(email);
      expect(component.errorMessage).toContain('reset instructions');
      expect(component.isLoading).toBeFalsy();
    }));

    it('should handle password reset request error', fakeAsync(() => {
      const email = 'test@example.com';
      const errorMessage = 'Reset failed';
      authService.requestPasswordReset.mockReturnValue(throwError(() => new Error(errorMessage)));

      component.loginForm.patchValue({ email });
      component.requestPasswordReset();
      tick();

      expect(component.errorMessage).toBe(errorMessage);
      expect(component.isLoading).toBeFalsy();
    }));
  });

  describe('Password Visibility', () => {
    it('should toggle password visibility', () => {
      expect(component.showPassword).toBeFalsy();
      
      component.togglePasswordVisibility();
      expect(component.showPassword).toBeTruthy();
      
      component.togglePasswordVisibility();
      expect(component.showPassword).toBeFalsy();
    });
  });
});
