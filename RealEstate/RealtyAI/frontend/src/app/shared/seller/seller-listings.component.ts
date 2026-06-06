/**
 * Seller "my listings" table — pending/approved/expired with renew and edit.
 * ==========================================================================
 * SHELL: loads via ListingService.getMyListings(); renew via SellerListingService.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import {
  LISTING_SCHEMA,
  ListingItem,
  accountManageEditRoute,
  accountManageNewPath,
  canRenewListing,
  formatApprovalStatus,
  formatExpiresAt,
  isListingExpired,
  listingDefaultDurationDays,
  listingDetailRoute,
} from '../../core/listing.schema';
import { ListingService } from '../listing/listing.service';
import { SellerAuthService } from './seller-auth.service';
import { SellerListingService } from './seller-listing.service';

@Component({
  selector: 'app-seller-listings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container admin-page">
      <div class="admin-toolbar">
        <div>
          <h1>My {{ schema.labels.plural }}</h1>
          <p>{{ roleLabel }} · {{ username }}</p>
          <p class="hint">
            All your listings appear here (pending, approved, expired, or rejected).
            Approved listings stay live for {{ durationDays }} days. Use <strong>Renew</strong> to request another period after expiry.
          </p>
        </div>
        <div class="admin-toolbar-actions">
          <a [routerLink]="accountNewPath" class="btn">List {{ schema.labels.singular }}</a>
          <button class="btn btn-secondary" (click)="logout()">Logout</button>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading…</div>

      <div class="card" *ngIf="!loading">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>City</th>
              <th>Status</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of myListings">
              <td>{{ item['title'] }}</td>
              <td>{{ item['city'] }}</td>
              <td>
                <span class="status-badge" [class]="'status-' + item.approval_status">
                  {{ formatStatus(item.approval_status) }}
                </span>
                <span *ngIf="item.approval_status === 'approved' && isExpired(item)" class="rejection-reason">Expired</span>
                <span *ngIf="item.rejection_reason" class="rejection-reason">{{ item.rejection_reason }}</span>
              </td>
              <td>{{ formatExpiry(item.expires_at) }}</td>
              <td class="admin-actions">
                <a [routerLink]="detailRoute(item.id)" class="btn btn-secondary">View</a>
                <a [routerLink]="editRoute(item.id)" class="btn btn-secondary">Edit</a>
                <button *ngIf="canRenew(item)" class="btn" (click)="renewItem(item)">Renew</button>
                <button class="btn btn-danger" (click)="deleteItem(item)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="myListings.length === 0" class="no-results">You have not listed any {{ schema.labels.plural.toLowerCase() }} yet.</p>
      </div>

      <a routerLink="/" class="back-link">← Back to site</a>
    </div>
  `,
})
export class SellerListingsComponent implements OnInit {
  readonly schema = LISTING_SCHEMA;
  readonly durationDays = listingDefaultDurationDays();
  readonly accountNewPath = accountManageNewPath();
  myListings: ListingItem[] = [];
  loading = false;
  username = '';
  roleLabel = '';

  constructor(
    private listingService: ListingService,
    private sellerListingService: SellerListingService,
    private auth: SellerAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.auth.getUsername() || '';
    this.roleLabel = this.auth.getRoleLabel();
    this.loadListings();
  }

  detailRoute(id: number): (string | number)[] {
    return listingDetailRoute(id);
  }

  editRoute(id: number): (string | number)[] {
    return accountManageEditRoute(id);
  }

  loadListings(): void {
    this.loading = true;
    this.listingService.getMyListings().subscribe({
      next: (data) => {
        this.myListings = data.results;
        this.loading = false;
      },
      error: () => {
        this.myListings = [];
        this.loading = false;
      },
    });
  }

  formatStatus(status: string | undefined): string {
    return formatApprovalStatus(status);
  }

  formatExpiry(value: string | null | undefined): string {
    return formatExpiresAt(value);
  }

  isExpired(item: ListingItem): boolean {
    return isListingExpired(item);
  }

  canRenew(item: ListingItem): boolean {
    return canRenewListing(item);
  }

  /** POST renew — resets listing to pending for admin re-approval */
  renewItem(item: ListingItem): void {
    if (!confirm(`Renew "${item['title']}"? It will be sent for admin approval.`)) {
      return;
    }
    this.sellerListingService.renewListing(item.id).subscribe({
      next: () => this.loadListings(),
      error: (err) => alert(err.error?.detail || 'Failed to renew listing.'),
    });
  }

  deleteItem(item: ListingItem): void {
    const label = this.schema.labels.singular.toLowerCase();
    if (!confirm(`Delete ${label} "${item['title']}"?`)) {
      return;
    }
    this.sellerListingService.deleteListing(item.id).subscribe({
      next: () => this.loadListings(),
      error: () => alert('Failed to delete listing.'),
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
