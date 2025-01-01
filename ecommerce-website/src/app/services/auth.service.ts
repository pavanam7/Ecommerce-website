import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: {
    notifications: boolean;
    newsletter: boolean;
    language: string;
  };
}

export type SocialProvider = 'google' | 'facebook' | 'twitter';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly TOKEN_EXPIRY_KEY = 'tokenExpiry';
  private readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

  private authStatus = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<UserProfile | null>(null);
  
  authStatus$ = this.authStatus.asObservable();
  currentUser$ = this.currentUser.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  private initializeAuth() {
    const token = this.getToken();
    if (token) {
      this.authStatus.next(true);
      this.setupTokenRefresh();
      this.loadCurrentUser();
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', { email, password })
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }

  socialLogin(provider: SocialProvider, token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`/api/auth/social/${provider}`, { token })
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }

  logout() {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (refreshToken) {
      this.http.post('/api/auth/logout', { refreshToken }).subscribe();
    }
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    this.authStatus.next(false);
    this.currentUser.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!token || !expiry) return false;
    return Date.now() < parseInt(expiry);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>('/api/auth/me').pipe(
      tap(user => this.currentUser.next(user)),
      catchError(this.handleError)
    );
  }

  updateUser(userData: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>('/api/auth/me', userData).pipe(
      tap(user => this.currentUser.next(user)),
      catchError(this.handleError)
    );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/register', { name, email, password })
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(this.handleError)
      );
  }

  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>('/api/auth/password-reset', { email })
      .pipe(catchError(this.handleError));
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>('/api/auth/password-reset/confirm', {
      token,
      newPassword
    }).pipe(catchError(this.handleError));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>('/api/auth/change-password', {
      currentPassword,
      newPassword
    }).pipe(catchError(this.handleError));
  }

  private handleAuthResponse(response: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, (Date.now() + response.expiresIn * 1000).toString());
    this.authStatus.next(true);
    this.setupTokenRefresh();
    this.loadCurrentUser();
  }

  private setupTokenRefresh() {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return;

    const expiryTime = parseInt(expiry);
    const refreshTime = expiryTime - this.REFRESH_THRESHOLD;
    const timeUntilRefresh = refreshTime - Date.now();

    if (timeUntilRefresh > 0) {
      timer(timeUntilRefresh).pipe(
        switchMap(() => this.refreshToken())
      ).subscribe();
    } else {
      this.refreshToken().subscribe();
    }
  }

  private refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>('/api/auth/refresh', { refreshToken })
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  private loadCurrentUser() {
    this.getCurrentUser().subscribe();
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Invalid credentials';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 422:
          errorMessage = 'Validation error';
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
