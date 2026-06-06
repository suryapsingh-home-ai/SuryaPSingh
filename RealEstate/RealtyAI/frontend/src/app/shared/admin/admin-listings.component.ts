/**
 * Admin manage table — all listings with approve/reject/edit/delete.
 * ==================================================================
 * SHELL: loads via ListingService (staff sees all statuses); mutations via AdminListingService.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import {
  LISTING_SCHEMA,
  ListingItem,
  adminManageEditRoute,
  adminManageNewPath,
  formatApprovalStatus,
  formatExpiresAt,
  listingDefaultDurationDays,
} from '../../core/listing.schema';
import { ListingService, PaginatedListings } from '../listing/listing.service';
import { AdminAuthService } from './admin-auth.service';
import { AdminListingService } from './admin-listing.service';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

@Component({
  selector: 'app-admin-listings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container admin-page">
      <div class="admin-toolbar">
        <div>
          <h1>Manage {{ schema.labels.plural }}</h1>
          <p>Signed in as {{ username }} · Approved listings expire after {{ durationDays }} days</p>
        </div>
        <div class="admin-toolbar-actions">
          <a [routerLink]="adminNewPath" class="btn">Add {{ schema.labels.singular }}</a>
          <button class="btn btn-secondary" (click)="logout()">Logout</button>
        </div>
      </div>

      <div class="filter-tabs">
        <button class="tab" [class.active]="statusFilter === 'all'" (click)="setFilter('all')">All</button>
        <button class="tab" [class.active]="statusFilter === 'pending'" (click)="setFilter('pending')">
          Pending ({{ pendingCount }})
        </button>
        <button class="tab" [class.active]="statusFilter === 'approved'" (click)="setFilter('approved')">Approved</button>
        <button class="tab" [class.active]="statusFilter === 'rejected'" (click)="setFilter('rejected')">Rejected</button>
      </div>

      <div *ngIf="loading" class="loading">Loading…</div>

      <div class="card" *ngIf="!loading">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Listed by</th>
              <th>Approval</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredListings">
              <td>{{ item.id }}</td>
              <td>{{ item['title'] }}</td>
              <td>{{ item.created_by_username || 'Admin' }}</td>
              <td>
                <span class="status-badge" [class]="'status-' + item.approval_status">
                  {{ formatStatus(item.approval_status) }}
                </span>
              </td>
              <td>{{ formatExpiry(item.expires_at) }}</td>
              <td class="admin-actions">
                <button *ngIf="item.approval_status === 'pending'" class="btn btn-success" (click)="approveItem(item)">
                  Approve
                </button>
                <button *ngIf="item.approval_status === 'pending'" class="btn btn-danger" (click)="rejectItem(item)">
                  Reject
                </button>
                <a [routerLink]="editRoute(item.id)" class="btn btn-secondary">Edit</a>
                <button class="btn btn-danger" (click)="deleteItem(item)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="filteredListings.length === 0" class="no-results">No listings in this view.</p>
      </div>

      <a routerLink="/" class="back-link">← Back to site</a>
    </div>
  `,
})
export class AdminListingsComponent implements OnInit {
  readonly schema = LISTING_SCHEMA;
  readonly durationDays = listingDefaultDurationDays();
  readonly adminNewPath = adminManageNewPath();
  listings: ListingItem[] = [];
  filteredListings: ListingItem[] = [];
  loading = false;
  username = '';
  statusFilter: StatusFilter = 'all';
  pendingCount = 0;

  constructor(
    private listingService: ListingService,
    private adminListingService: AdminListingService,
    private auth: AdminAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.auth.getUsername() || 'Admin';
    this.loadListings();
  }

  editRoute(id: number): (string | number)[] {
    return adminManageEditRoute(id);
  }

  loadListings(): void {
    this.loading = true;
    this.listingService.getListings({ page_size: 100 }).subscribe({
      next: (data: PaginatedListings) => {
        this.listings = data.results;
        this.pendingCount = this.listings.filter((item) => item.approval_status === 'pending').length;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.listings = [];
        this.filteredListings = [];
        this.loading = false;
      },
    });
  }

  setFilter(filter: StatusFilter): void {
    this.statusFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.statusFilter === 'all') {
      this.filteredListings = this.listings;
      return;
    }
    this.filteredListings = this.listings.filter((item) => item.approval_status === this.statusFilter);
  }

  formatStatus(status: string | undefined): string {
    return formatApprovalStatus(status);
  }

  formatExpiry(value: string | null | undefined): string {
    return formatExpiresAt(value);
  }

  /** POST approve action then refresh table */
  approveItem(item: ListingItem): void {
    this.adminListingService.approveListing(item.id).subscribe({
      next: () => this.loadListings(),
      error: () => alert('Failed to approve listing.'),
    });
  }

  rejectItem(item: ListingItem): void {
    const reason = prompt('Rejection reason (optional):') || '';
    this.adminListingService.rejectListing(item.id, reason).subscribe({
      next: () => this.loadListings(),
      error: () => alert('Failed to reject listing.'),
    });
  }

  deleteItem(item: ListingItem): void {
    const label = this.schema.labels.singular.toLowerCase();
    if (!confirm(`Delete ${label} "${item['title']}"?`)) {
      return;
    }
    this.adminListingService.deleteListing(item.id).subscribe({
      next: () => this.loadListings(),
      error: () => alert('Failed to delete. You may not have permission.'),
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
