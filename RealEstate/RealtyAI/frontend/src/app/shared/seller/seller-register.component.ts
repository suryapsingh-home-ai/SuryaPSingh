/**
 * Seller registration — creates agent/owner account via /api/auth/register/.
 * ===========================================================================
 * SHELL: display_name and phone appear on approved listing detail contact block.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { SellerAuthService, SellerRole } from './seller-auth.service';
import { accountManageRoute } from '../../core/listing.schema';

@Component({
  selector: 'app-seller-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container admin-page">
      <div class="card admin-card">
        <div class="card-content">
          <h1>Create account</h1>
          <p>Register as an agent or property owner. Your name, phone, and email appear on approved listings.</p>

          <form (ngSubmit)="onSubmit()" class="admin-form">
            <label>
              Account type
              <select [(ngModel)]="role" name="role" required>
                <option value="agent">Agent</option>
                <option value="owner">Property Owner</option>
              </select>
            </label>

            <label>
              Display name
              <input type="text" [(ngModel)]="displayName" name="displayName" placeholder="Name shown to buyers" />
            </label>

            <label>
              Username
              <input type="text" [(ngModel)]="username" name="username" required autocomplete="username" />
            </label>

            <label>
              Email
              <input type="email" [(ngModel)]="email" name="email" autocomplete="email" />
            </label>

            <label>
              Phone
              <input type="tel" [(ngModel)]="phone" name="phone" placeholder="Shown on your listings" />
            </label>

            <label>
              Password
              <input type="password" [(ngModel)]="password" name="password" required autocomplete="new-password" />
            </label>

            <p class="error" *ngIf="error">{{ error }}</p>

            <div class="admin-form-actions">
              <button class="btn" type="submit" [disabled]="loading">{{ loading ? 'Creating…' : 'Create account' }}</button>
              <a routerLink="/account/login" class="btn btn-secondary">Sign in instead</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class SellerRegisterComponent implements OnInit {
  username = '';
  displayName = '';
  email = '';
  phone = '';
  password = '';
  role: SellerRole = 'owner';
  loading = false;
  error = '';

  constructor(private auth: SellerAuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(accountManageRoute());
    }
  }

  onSubmit(): void {
    this.error = '';
    this.loading = true;
    this.auth
      .register({
        username: this.username,
        display_name: this.displayName,
        password: this.password,
        email: this.email,
        phone: this.phone,
        role: this.role,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(accountManageRoute());
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.username?.[0] || err.error?.password?.[0] || err.error?.detail || 'Registration failed.';
        },
      });
  }
}
