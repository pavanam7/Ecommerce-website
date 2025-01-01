import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, AuthResponse, UserProfile, SocialProvider } from './auth.service';
import { BehaviorSubject } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockAuthResponse: AuthResponse = {
    token: 'mock-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600
  };

  const mockUserProfile: UserProfile = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    preferences: {
      notifications: true,
      newsletter: false,
      language: 'en'
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Login', () => {
    it('should authenticate user and store tokens', () => {
      const email = 'test@example.com';
      const password = 'password123';

      service.login(email, password).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('authToken')).toBe(mockAuthResponse.token);
        expect(localStorage.getItem('refreshToken')).toBe(mockAuthResponse.refreshToken);
        expect(localStorage.getItem('tokenExpiry')).toBeTruthy();
      });

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email, password });
      req.flush(mockAuthResponse);
    });

    it('should handle login error', () => {
      service.login('test@example.com', 'wrong-password').subscribe({
        error: err => {
          expect(err.message).toBe('Invalid credentials');
          expect(localStorage.getItem('authToken')).toBeNull();
        }
      });

      const req = httpMock.expectOne('/api/auth/login');
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('Social Login', () => {
    it('should authenticate with social provider', () => {
      const provider: SocialProvider = 'google';
      const token = 'mock-social-token';

      service.socialLogin(provider, token).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('authToken')).toBe(mockAuthResponse.token);
      });

      const req = httpMock.expectOne(`/api/auth/social/${provider}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ token });
      req.flush(mockAuthResponse);
    });
  });

  describe('Token Management', () => {
    it('should refresh token before expiry', () => {
      // Set up initial tokens
      localStorage.setItem('authToken', 'old-token');
      localStorage.setItem('refreshToken', 'old-refresh-token');
      localStorage.setItem('tokenExpiry', (Date.now() + 5000).toString()); // 5 seconds from now

      service['setupTokenRefresh']();

      // Fast-forward time to trigger refresh
      jest.advanceTimersByTime(3000);

      const req = httpMock.expectOne('/api/auth/refresh');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'old-refresh-token' });
      req.flush(mockAuthResponse);

      expect(localStorage.getItem('authToken')).toBe(mockAuthResponse.token);
    });

    it('should handle refresh token failure', () => {
      localStorage.setItem('authToken', 'old-token');
      localStorage.setItem('refreshToken', 'invalid-refresh-token');
      localStorage.setItem('tokenExpiry', (Date.now() + 5000).toString());

      service['setupTokenRefresh']();
      jest.advanceTimersByTime(3000);

      const req = httpMock.expectOne('/api/auth/refresh');
      req.flush({ message: 'Invalid refresh token' }, { status: 401, statusText: 'Unauthorized' });

      expect(localStorage.getItem('authToken')).toBeNull();
      const authStatus = service.authStatus$ as BehaviorSubject<boolean>;
      expect(authStatus.getValue()).toBeFalsy();
    });
  });

  describe('Password Management', () => {
    it('should request password reset', () => {
      const email = 'test@example.com';

      service.requestPasswordReset(email).subscribe(() => {
        expect(true).toBeTruthy(); // Just verify subscription completes
      });

      const req = httpMock.expectOne('/api/auth/password-reset');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email });
      req.flush({});
    });

    it('should reset password with token', () => {
      const token = 'reset-token';
      const newPassword = 'new-password123';

      service.resetPassword(token, newPassword).subscribe(() => {
        expect(true).toBeTruthy(); // Just verify subscription completes
      });

      const req = httpMock.expectOne('/api/auth/password-reset/confirm');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ token, newPassword });
      req.flush({});
    });

    it('should change password for authenticated user', () => {
      const currentPassword = 'old-password';
      const newPassword = 'new-password123';

      service.changePassword(currentPassword, newPassword).subscribe(() => {
        expect(true).toBeTruthy(); // Just verify subscription completes
      });

      const req = httpMock.expectOne('/api/auth/change-password');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ currentPassword, newPassword });
      req.flush({});
    });
  });

  describe('User Profile', () => {
    it('should get current user profile', () => {
      service.getCurrentUser().subscribe(user => {
        expect(user).toEqual(mockUserProfile);
      });

      const req = httpMock.expectOne('/api/auth/me');
      expect(req.request.method).toBe('GET');
      req.flush(mockUserProfile);
    });

    it('should update user profile', () => {
      const updates = {
        name: 'Updated Name',
        preferences: { 
          notifications: false,
          newsletter: false,
          language: 'en'
        }
      };

      service.updateUser(updates).subscribe(user => {
        expect(user).toEqual({ ...mockUserProfile, ...updates });
      });

      const req = httpMock.expectOne('/api/auth/me');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush({ ...mockUserProfile, ...updates });
    });
  });

  describe('Authentication State', () => {
    it('should check authentication status', () => {
      expect(service.isAuthenticated()).toBeFalsy();

      localStorage.setItem('authToken', 'valid-token');
      localStorage.setItem('tokenExpiry', (Date.now() + 3600000).toString());

      expect(service.isAuthenticated()).toBeTruthy();
    });

    it('should handle logout', () => {
      localStorage.setItem('authToken', 'token');
      localStorage.setItem('refreshToken', 'refresh-token');
      (service.authStatus$ as any).next(true);
      (service.currentUser$ as any).next(mockUserProfile);

      service.logout();

      const req = httpMock.expectOne('/api/auth/logout');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'refresh-token' });
      req.flush({});

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      const authStatus = service.authStatus$ as BehaviorSubject<boolean>;
      const currentUser = service.currentUser$ as BehaviorSubject<UserProfile | null>;
      expect(authStatus.getValue()).toBeFalsy();
      expect(currentUser.getValue()).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', () => {
      service.login('test@example.com', 'password123').subscribe({
        error: err => {
          expect(err.message).toBe('An error occurred');
        }
      });

      const req = httpMock.expectOne('/api/auth/login');
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle validation errors', () => {
      service.register('Test', 'invalid-email', 'password123').subscribe({
        error: err => {
          expect(err.message).toBe('Validation error');
        }
      });

      const req = httpMock.expectOne('/api/auth/register');
      req.flush({ message: 'Invalid email format' }, { status: 422, statusText: 'Unprocessable Entity' });
    });
  });
});