/**
 * Public detail page — single listing with contact block when live.
 * =================================================================
 * SHELL: detail fields from detailDisplayFields(); contact from API lister_* fields.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import {
  LISTING_SCHEMA,
  ListingField,
  ListingItem,
  detailDisplayFields,
  detailImagePlaceholder,
  formatItemField,
  hasListerContact,
  listingListPath,
} from '../../core/listing.schema';
import { ListingService } from './listing.service';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listing-detail.component.html',
})
export class ListingDetailComponent implements OnInit, OnDestroy {
  readonly schema = LISTING_SCHEMA;
  readonly detailFields = detailDisplayFields().filter(
    (field) => !['title', 'price', 'image_url', 'description'].includes(field.name)
  );
  readonly descriptionField = LISTING_SCHEMA.fields.find((f) => f.name === 'description');
  readonly priceField: ListingField = LISTING_SCHEMA.fields.find((f) => f.name === 'price') ?? {
    name: 'price',
    type: 'money',
    label: 'Price',
  };
  readonly listPath = listingListPath();
  readonly detailImagePlaceholder = detailImagePlaceholder;
  readonly formatValue = formatItemField;
  readonly hasContact = hasListerContact;

  item: ListingItem | null = null;
  loading = false;
  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!id) {
        this.router.navigate([this.listPath]);
        return;
      }
      this.loadItem(id);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  /** Load listing by route :id param */
  loadItem(id: number): void {
    this.loading = true;
    this.item = null;
    this.listingService.getListing(id).subscribe({
      next: (data) => {
        this.item = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  imageFor(item: ListingItem): string {
    const url = item['image_url'];
    return url ? String(url) : this.detailImagePlaceholder();
  }

  locationLine(item: ListingItem): string {
    const parts = [item['city'], item['state']].filter(Boolean);
    return parts.join(', ');
  }
}
