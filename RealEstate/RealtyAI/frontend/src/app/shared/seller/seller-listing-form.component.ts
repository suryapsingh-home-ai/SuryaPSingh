/**
 * Seller add/edit form — schema-driven fields; submit goes pending for approval.
 * ===============================================================================
 * SHELL: same field loop as admin form; uses SellerListingService for POST/PUT.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  LISTING_SCHEMA,
  ListingField,
  accountManagePath,
  accountManageRoute,
  listingDefaultDurationDays,
} from '../../core/listing.schema';
import { ListingService } from '../listing/listing.service';
import { SellerListingService } from './seller-listing.service';

@Component({
  selector: 'app-seller-listing-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './seller-listing-form.component.html',
})
export class SellerListingFormComponent implements OnInit {
  readonly schema = LISTING_SCHEMA;
  readonly formFields = LISTING_SCHEMA.fields;
  readonly durationDays = listingDefaultDurationDays();
  readonly managePath = accountManagePath();

  formData: Record<string, string | number | null> = {};
  loading = false;
  saving = false;
  error = '';
  success = '';
  isEdit = false;
  itemId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listingService: ListingService,
    private sellerListingService: SellerListingService
  ) {}

  ngOnInit(): void {
    this.initEmptyForm();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.isEdit = true;
      this.itemId = id;
      this.loadItem(id);
    }
  }

  /** Default empty values per field type */
  initEmptyForm(): void {
    for (const field of this.formFields) {
      if (field.type === 'choice' && field.default) {
        this.formData[field.name] = field.default;
      } else if (field.type === 'integer') {
        this.formData[field.name] = 0;
      } else {
        this.formData[field.name] = '';
      }
    }
  }

  loadItem(id: number): void {
    this.loading = true;
    this.listingService.getListing(id).subscribe({
      next: (item) => {
        for (const field of this.formFields) {
          const value = item[field.name];
          this.formData[field.name] = value === undefined || value === null ? '' : value;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Could not load listing.';
      },
    });
  }

  isChoice(field: ListingField): boolean {
    return field.type === 'choice';
  }

  isTextArea(field: ListingField): boolean {
    return field.type === 'text';
  }

  isNumber(field: ListingField): boolean {
    return field.type === 'money' || field.type === 'integer';
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';
    this.saving = true;
    const payload = this.buildPayload();

    const request$ =
      this.isEdit && this.itemId
        ? this.sellerListingService.updateListing(this.itemId, payload)
        : this.sellerListingService.createListing(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        if (this.isEdit) {
          this.router.navigate(accountManageRoute());
          return;
        }
        this.success = `Submitted for admin approval. Once approved, your listing will be visible for ${this.durationDays} days.`;
        setTimeout(() => this.router.navigate(accountManageRoute()), 2000);
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.detail || 'Save failed. Check all required fields.';
      },
    });
  }

  /** Map formData to API payload with correct number/string types */
  buildPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    for (const field of this.formFields) {
      const raw = this.formData[field.name];
      if (field.type === 'money' || field.type === 'integer') {
        payload[field.name] = raw === '' || raw === null ? null : Number(raw);
      } else {
        payload[field.name] = raw ?? '';
      }
    }
    return payload;
  }
}
