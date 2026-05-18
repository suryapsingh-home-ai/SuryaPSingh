import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ListingService, PaginatedListings } from './listing.service';
import { Listing } from './listing';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <section class="hero card">
        <div class="card-content">
          <h1>Find your next home with RealtyAI</h1>
          <p>Browse verified listings for sale and rent, explore featured properties, and get a fast demo-ready experience.</p>
          <a routerLink="/listings" class="btn">Browse all listings</a>
        </div>
      </section>

      <section class="featured">
        <h2>Featured Properties</h2>
        <div *ngIf="loading">Loading featured listings...</div>
        <div class="property-grid" *ngIf="!loading">
          <div class="card" *ngFor="let listing of featuredListings">
            <img [src]="listing.image_url || 'https://via.placeholder.com/800x480?text=Property'" alt="{{ listing.title }}" />
            <div class="card-content">
              <h3>{{ listing.title }}</h3>
              <p>{{ listing.city }}, {{ listing.state }}</p>
              <p><strong>{{ listing.price | currency:'USD' }}</strong></p>
              <a [routerLink]="['/listing', listing.id]" class="btn">View details</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  featuredListings: Listing[] = [];
  loading = false;

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
    this.loading = true;
    this.listingService.getListings({ page_size: 4 }).subscribe({
      next: (data: PaginatedListings) => {
        this.featuredListings = data.results.slice(0, 4);
        this.loading = false;
      },
      error: () => {
        this.featuredListings = [];
        this.loading = false;
      }
    });
  }
}
