/**
 * Seller login page — agent/owner credentials → seller_token.
 * ============================================================
 * SHELL: redirects to accountManageRoute() on success.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { LISTING_SCHEMA, accountManageRoute, listingDefaultDurationDays } from '../../core/listing.schema';
import { SellerAuthService } from './seller-auth.service';

@Component({
  selector: 'app-seller-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container admin-page">
      <div class="card admin-card">
        <div class="card-content">
          <h1>Agent / Owner sign in</h1>
          <p>List {{ schema.labels.plural.toLowerCase() }} after admin approval. Approved listings stay live for {{ durationDays }} days.</p>

          <form (ngSubmit)="onSubmit()" class="admin-form">
            <label>
              Username
              <input type="text" [(ngModel)]="username" name="username" required autocomplete="username" />
            </label>

            <label>
              Password
              <input type="password" [(ngModel)]="password" name="password" required autocomplete="current-password" />
            </label>

            <p class="error" *ngIf="error">{{ error }}</p>

            <div class="admin-form-actions">
              <button class="btn" type="submit" [disabled]="loading">{{ loading ? 'Signing in…' : 'Sign in' }}</button>
              <a routerLink="/account/register" class="btn btn-secondary">Create account</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class SellerLoginComponent implements OnInit {
  readonly schema = LISTING_SCHEMA;
  readonly durationDays = listingDefaultDurationDays();
  username = '';
  password = '';
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
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(accountManageRoute());
      },
      error: () => {
        this.loading = false;
        this.error = 'Invalid credentials or not an agent/owner account.';
      },
    });
  }
}
