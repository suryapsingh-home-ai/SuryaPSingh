/**
 * Admin login page — staff credentials → admin_token.
 * ===================================================
 * SHELL: redirects to adminManageRoute() on success.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { LISTING_SCHEMA, adminManageRoute } from '../../core/listing.schema';
import { AdminAuthService } from './admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container admin-page">
      <div class="card admin-card">
        <div class="card-content">
          <h1>Admin Login</h1>
          <p>Only staff accounts can add or edit {{ schema.labels.plural.toLowerCase() }}.</p>

          <form (ngSubmit)="onSubmit()" class="admin-form">
            <label>
              Username
              <input [(ngModel)]="username" name="username" required autocomplete="username" />
            </label>
            <label>
              Password
              <input [(ngModel)]="password" name="password" type="password" required autocomplete="current-password" />
            </label>
            <p class="error" *ngIf="error">{{ error }}</p>
            <button class="btn" type="submit" [disabled]="loading">{{ loading ? 'Signing in…' : 'Sign in' }}</button>
          </form>

          <a routerLink="/" class="back-link">← Back to site</a>
        </div>
      </div>
    </div>
  `,
})
export class AdminLoginComponent implements OnInit {
  username = '';
  password = '';
  error = '';
  loading = false;
  readonly schema = LISTING_SCHEMA;

  constructor(private auth: AdminAuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(adminManageRoute());
    }
  }

  onSubmit(): void {
    this.error = '';
    this.loading = true;
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(adminManageRoute());
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Invalid credentials or not an admin account.';
      },
    });
  }
}
