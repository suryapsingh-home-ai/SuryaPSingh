/**
 * Seller auth — register, login, token storage for agent/owner accounts.
 * =======================================================================
 * SHELL: stores seller_token; profile fields used for lister contact on detail page.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'seller_token';
const USERNAME_KEY = 'seller_username';
const ROLE_KEY = 'seller_role';

export type SellerRole = 'agent' | 'owner';

export interface SellerAuthResponse {
  token: string;
  username: string;
  role: SellerRole;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email?: string;
  display_name?: string;
  role: SellerRole;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class SellerAuthService {
  constructor(private http: HttpClient, private router: Router) {}

  /** POST /api/auth/register/ — creates User + ListingProfile */
  register(payload: RegisterPayload): Observable<SellerAuthResponse> {
    return this.http
      .post<SellerAuthResponse>(`${environment.apiBaseUrl}/auth/register/`, payload)
      .pipe(tap((response) => this.storeSession(response)));
  }

  /** POST /api/auth/login/ — lister token */
  login(username: string, password: string): Observable<SellerAuthResponse> {
    return this.http
      .post<SellerAuthResponse>(`${environment.apiBaseUrl}/auth/login/`, { username, password })
      .pipe(tap((response) => this.storeSession(response)));
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${environment.apiBaseUrl}/auth/logout/`, {}).subscribe({
        complete: () => this.clearSession(),
        error: () => this.clearSession(),
      });
    } else {
      this.clearSession();
    }
  }

  storeSession(response: SellerAuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USERNAME_KEY, response.username);
    localStorage.setItem(ROLE_KEY, response.role);
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(ROLE_KEY);
    this.router.navigate(['/account/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUsername(): string | null {
    return localStorage.getItem(USERNAME_KEY);
  }

  getRole(): SellerRole | null {
    return localStorage.getItem(ROLE_KEY) as SellerRole | null;
  }

  getRoleLabel(): string {
    const role = this.getRole();
    if (role === 'agent') return 'Agent';
    if (role === 'owner') return 'Property Owner';
    return '';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
