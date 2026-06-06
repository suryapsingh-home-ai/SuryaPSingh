/**
 * Public browse page — filters, search, pagination, listing cards.
 * ===============================================================
 * SHELL: sidebar filters built from schema filterableFields(); cards from show_in_list.
 * Optional geolocation pre-fills city filter when schema has a city field.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  LISTING_SCHEMA,
  ListingField,
  ListingItem,
  filterableFields,
  formatItemField,
  imagePlaceholder,
  listDisplayFields,
  listingDetailRoute,
  sortableFields,
} from '../../core/listing.schema';
import { ListingService, PaginatedListings } from './listing.service';

@Component({
  selector: 'app-listing-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './listing-list.component.html',
})
export class ListingListComponent implements OnInit {
  readonly schema = LISTING_SCHEMA;
  readonly filterFields = filterableFields();
  readonly sortFields = sortableFields();
  readonly cardFields = listDisplayFields().filter((field) => !['title', 'price', 'image_url'].includes(field.name));

  paginatedData: PaginatedListings = { count: 0, next: null, previous: null, results: [] };
  filters: Record<string, string | number | undefined> = {
    page: 1,
    page_size: 12,
    ordering: '-created_at',
  };

  loading = false;
  sidebarOpen = true;
  currentPage = 1;
  totalPages = 1;
  currentCity = '';
  detectingLocation = false;
  cityField = LISTING_SCHEMA.fields.find((field) => field.name === 'city');

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
    if (this.cityField) {
      this.detectLocation();
    } else {
      this.loadListings();
    }
  }

  /** Resolve card image or schema placeholder */
  imageFor(item: ListingItem): string {
    const url = item['image_url'];
    return url ? String(url) : imagePlaceholder();
  }

  formatValue(field: ListingField, item: ListingItem): string {
    return formatItemField(field, item);
  }

  detailRoute(item: ListingItem): (string | number)[] {
    return listingDetailRoute(item.id);
  }

  /** Try browser geolocation → OpenStreetMap reverse geocode → city filter */
  detectLocation(): void {
    if (!navigator.geolocation) {
      this.loadListings();
      return;
    }
    this.detectingLocation = true;
    navigator.geolocation.getCurrentPosition(
      (position) => this.reverseGeocode(position.coords.latitude, position.coords.longitude),
      () => {
        this.detectingLocation = false;
        this.loadListings();
      }
    );
  }

  reverseGeocode(lat: number, lon: number): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
      .then((response) => response.json())
      .then((data) => {
        const city = data.address?.city || data.address?.town;
        if (city && this.cityField) {
          this.currentCity = city;
          this.filters[this.cityField.name] = city;
        }
        this.detectingLocation = false;
        this.loadListings();
      })
      .catch(() => {
        this.detectingLocation = false;
        this.loadListings();
      });
  }

  onCityChange(city: string): void {
    if (!this.cityField) return;
    this.currentCity = city;
    this.filters[this.cityField.name] = city || undefined;
    this.onFilterChange();
  }

  /** Fetch paginated listings from API using current filters */
  loadListings(): void {
    this.loading = true;
    this.listingService.getListings(this.filters).subscribe({
      next: (data) => {
        this.paginatedData = data;
        this.totalPages = Math.ceil(data.count / Number(this.filters['page_size'] || 12));
        this.loading = false;
      },
      error: () => {
        this.paginatedData = { count: 0, next: null, previous: null, results: [] };
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.filters['page'] = 1;
    this.loadListings();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.filters['page'] = 1;
    this.loadListings();
  }

  previousPage(): void {
    if (this.paginatedData.previous && this.currentPage > 1) {
      this.currentPage--;
      this.filters['page'] = this.currentPage;
      this.loadListings();
    }
  }

  nextPage(): void {
    if (this.paginatedData.next) {
      this.currentPage++;
      this.filters['page'] = this.currentPage;
      this.loadListings();
    }
  }

  hasActiveFilters(): boolean {
    if (this.filters['search']) return true;
    return this.filterFields.some((field) => {
      if (field.filter === 'exact' && this.filters[field.name]) return true;
      if (field.filter === 'range' && (this.filters[`${field.name}_min`] || this.filters[`${field.name}_max`])) {
        return true;
      }
      return false;
    });
  }

  clearFilter(field: ListingField): void {
    if (field.filter === 'exact') {
      this.filters[field.name] = undefined;
      if (field.name === 'city') this.currentCity = '';
    }
    if (field.filter === 'range') {
      this.filters[`${field.name}_min`] = undefined;
      this.filters[`${field.name}_max`] = undefined;
    }
    this.onFilterChange();
  }

  clearSearch(): void {
    this.filters['search'] = undefined;
    this.onFilterChange();
  }

  clearAllFilters(): void {
    this.currentCity = '';
    this.filters = { page: 1, page_size: 12, ordering: '-created_at' };
    this.onFilterChange();
  }

  filterTagLabel(field: ListingField): string {
    if (field.filter === 'exact') {
      return `${field.label}: ${this.filters[field.name]}`;
    }
    const min = this.filters[`${field.name}_min`] ?? 0;
    const max = this.filters[`${field.name}_max`] ?? 'Any';
    return `${field.label}: ${min} - ${max}`;
  }

  isFilterActive(field: ListingField): boolean {
    if (field.filter === 'exact') return !!this.filters[field.name];
    return !!(this.filters[`${field.name}_min`] || this.filters[`${field.name}_max`]);
  }
}
