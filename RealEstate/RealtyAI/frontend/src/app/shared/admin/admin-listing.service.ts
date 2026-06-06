/**
 * Admin listing mutations — create, update, delete, approve, reject.
 * ==================================================================
 * SHELL: POST/PUT/DELETE and custom actions on /api/{schema.id}/.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LISTING_SCHEMA, ListingItem } from '../../core/listing.schema';

@Injectable({ providedIn: 'root' })
export class AdminListingService {
  private apiUrl = `${environment.apiBaseUrl}/${LISTING_SCHEMA.id}/`;

  constructor(private http: HttpClient) {}

  /** POST — staff create (auto-approved on backend) */
  createListing(data: Record<string, unknown>): Observable<ListingItem> {
    return this.http.post<ListingItem>(this.apiUrl, data);
  }

  /** PUT — staff update any listing */
  updateListing(id: number, data: Record<string, unknown>): Observable<ListingItem> {
    return this.http.put<ListingItem>(`${this.apiUrl}${id}/`, data);
  }

  deleteListing(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  /** POST .../approve/ — sets approved + expires_at */
  approveListing(id: number): Observable<ListingItem> {
    return this.http.post<ListingItem>(`${this.apiUrl}${id}/approve/`, {});
  }

  /** POST .../reject/ — optional reason in body */
  rejectListing(id: number, reason = ''): Observable<ListingItem> {
    return this.http.post<ListingItem>(`${this.apiUrl}${id}/reject/`, { reason });
  }
}
