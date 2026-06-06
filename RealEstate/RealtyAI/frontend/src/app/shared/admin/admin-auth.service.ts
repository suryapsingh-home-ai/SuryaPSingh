/**
 * Admin auth — token storage and login/logout against /api/auth/admin-*.
 * ======================================================================
 * SHELL: stores admin_token in localStorage; used by adminGuard and authInterceptor.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'admin_token';
const USERNAME_KEY = 'admin_username';

export interface AdminLoginResponse {
  token: string;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  constructor(private http: HttpClient, private router: Router) {}

  /** POST /api/auth/admin-login/ and persist token */
  login(username: string, password: string): Observable<AdminLoginResponse> {
    return this.http
      .post<AdminLoginResponse>(`${environment.apiBaseUrl}/auth/admin-login/`, { username, password })
      .pipe(
        tap((response) => {
          localStorage.setItem(TOKEN_KEY, response.token);
          localStorage.setItem(USERNAME_KEY, response.username);
        })
      );
  }

  /** POST /api/auth/admin-logout/ and clear session */
  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${environment.apiBaseUrl}/auth/admin-logout/`, {}).subscribe({
        complete: () => this.clearSession(),
        error: () => this.clearSession(),
      });
    } else {
      this.clearSession();
    }
  }

  /** Remove tokens and redirect to admin login */
  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUsername(): string | null {
    return localStorage.getItem(USERNAME_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
