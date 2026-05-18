import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ListingService } from './listing.service';
import { Listing } from './listing';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container" *ngIf="listing">
      <div class="card">
        <img [src]="listing.image_url || 'https://via.placeholder.com/1200x600?text=Property'" alt="{{ listing.title }}" />
        <div class="card-content details">
          <div class="listing-header">
            <div>
              <h2>{{ listing.title }}</h2>
              <div>{{ listing.city }}, {{ listing.state }} • {{ listing.property_type | titlecase }}</div>
            </div>
            <div>
              <strong>{{ listing.price | currency:'USD' }}</strong>
            </div>
          </div>

          <p>{{ listing.description }}</p>
          <p><strong>Address:</strong> {{ listing.address }}, {{ listing.city }}, {{ listing.state }} {{ listing.zipcode }}</p>
          <p><strong>Bedrooms:</strong> {{ listing.bedrooms }} | <strong>Bathrooms:</strong> {{ listing.bathrooms }} | <strong>Area:</strong> {{ listing.area_sqft }} sqft</p>
          <a routerLink="/" class="btn">Back to listings</a>
        </div>
      </div>
    </div>

    <div class="container" *ngIf="loading">Loading property details...</div>
    <div class="container" *ngIf="!loading && !listing">Property not found.</div>
  `,
})
export class ListingDetailComponent implements OnInit {
  listing: Listing | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/']);
      return;
    }
    this.loading = true;
    this.listingService.getListing(id).subscribe({
      next: data => {
        this.listing = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
