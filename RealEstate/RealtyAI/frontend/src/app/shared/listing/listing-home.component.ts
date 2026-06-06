/**
 * Landing page — hero copy from schema.home and featured listing grid.
 * ====================================================================
 * SHELL: headline/subheadline/CTA from LISTING_SCHEMA.home.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  LISTING_SCHEMA,
  ListingItem,
  formatItemField,
  imagePlaceholder,
  listingDetailRoute,
  listingListPath,
} from '../../core/listing.schema';
import { ListingService, PaginatedListings } from './listing.service';

@Component({
  selector: 'app-listing-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <section class="hero card">
        <div class="card-content">
          <h1>{{ schema.home.headline }}</h1>
          <p>{{ schema.home.subheadline }}</p>
          <a [routerLink]="listPath" class="btn">{{ schema.home.browse_cta }}</a>
        </div>
      </section>

      <section class="featured">
        <h2>{{ schema.home.featured_title }}</h2>
        <div *ngIf="loading">Loading featured {{ schema.labels.plural.toLowerCase() }}...</div>
        <div class="property-grid" *ngIf="!loading">
          <a class="card card-link" *ngFor="let item of featured" [routerLink]="detailRoute(item)">
            <img [src]="item['image_url'] || imagePlaceholder()" [alt]="item['title']" />
            <div class="card-content">
              <h3>{{ item['title'] }}</h3>
              <p *ngIf="item['city'] || item['state']">{{ item['city'] }}<span *ngIf="item['city'] && item['state']">, </span>{{ item['state'] }}</p>
              <p *ngIf="item['price'] !== undefined">
                <strong>{{ formatValue(priceField, item) }}</strong>
              </p>
              <span class="btn">View details</span>
            </div>
          </a>
        </div>
      </section>
    </div>
  `,
})
export class ListingHomeComponent implements OnInit {
  readonly schema = LISTING_SCHEMA;
  readonly listPath = listingListPath();
  readonly imagePlaceholder = imagePlaceholder;
  readonly formatValue = formatItemField;
  readonly priceField = LISTING_SCHEMA.fields.find((f) => f.name === 'price') ?? {
    name: 'price',
    type: 'money' as const,
    label: 'Price',
  };
  readonly detailRoute = (item: ListingItem) => listingDetailRoute(item.id);

  featured: ListingItem[] = [];
  loading = false;

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
    this.loading = true;
    this.listingService.getListings({ page_size: 4 }).subscribe({
      next: (data: PaginatedListings) => {
        this.featured = data.results.slice(0, 4);
        this.loading = false;
      },
      error: () => {
        this.featured = [];
        this.loading = false;
      },
    });
  }
}
