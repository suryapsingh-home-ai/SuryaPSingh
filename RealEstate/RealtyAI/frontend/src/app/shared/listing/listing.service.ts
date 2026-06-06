/**
 * Public listing HTTP client — browse, detail, and "my listings" queries.
 * ========================================================================
 * SHELL: builds query params from LISTING_SCHEMA field flags (filter, search).
 * Used by listing/, admin/, and seller/ components for GET requests.
 *
 * Comment standard: purpose on the line BEFORE each method or meaningful variable.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LISTING_SCHEMA, ListingItem } from '../../core/listing.schema';

// Shape of paginated DRF response from GET /api/{id}/
export interface PaginatedListings {
  count: number;
  next: string | null;
  previous: string | null;
  results: ListingItem[];
}

@Injectable({ providedIn: 'root' })
export class ListingService {
  // e.g. http://localhost:8000/api/properties/
  private apiUrl = `${environment.apiBaseUrl}/${LISTING_SCHEMA.id}/`;

  constructor(private http: HttpClient) {}

  // GET /api/{id}/ — converts filters object to Django query params from schema
  getListings(filters: Record<string, string | number | undefined> = {}): Observable<PaginatedListings> {
    let params = new HttpParams();

    if (filters['search']) {
      params = params.set('search', String(filters['search']));
    }

    // Loop schema fields: exact filters → ?city=Austin, range → ?price__gte=100000
    for (const field of LISTING_SCHEMA.fields) {
      const value = filters[field.name];
      if (field.filter === 'exact' && value !== undefined && value !== '') {
        params = params.set(field.name, String(value));
      }
      if (field.filter === 'range') {
        const min = filters[`${field.name}_min`];
        const max = filters[`${field.name}_max`];
        if (min !== undefined && min !== '') params = params.set(`${field.name}__gte`, String(min));
        if (max !== undefined && max !== '') params = params.set(`${field.name}__lte`, String(max));
      }
    }

    if (filters['page']) params = params.set('page', String(filters['page']));
    if (filters['page_size']) params = params.set('page_size', String(filters['page_size']));
    if (filters['ordering']) params = params.set('ordering', String(filters['ordering']));
    if (filters['mine']) params = params.set('mine', '1');

    return this.http.get<PaginatedListings>(this.apiUrl, { params });
  }

  // Seller account page — requires Authorization: Token header from seller login
  getMyListings(): Observable<PaginatedListings> {
    return this.getListings({ mine: 1, page_size: 100 });
  }

  // GET /api/{id}/{pk}/ — public detail (contact fields when approved + live)
  getListing(id: number): Observable<ListingItem> {
    return this.http.get<ListingItem>(`${this.apiUrl}${id}/`);
  }
}
