/**
 * Seller listing mutations — create, update, delete, renew (pending re-approval).
 * ================================================================================
 * SHELL: lister create goes pending; renew calls POST .../renew/.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LISTING_SCHEMA, ListingItem } from '../../core/listing.schema';

@Injectable({ providedIn: 'root' })
export class SellerListingService {
  private apiUrl = `${environment.apiBaseUrl}/${LISTING_SCHEMA.id}/`;

  constructor(private http: HttpClient) {}

  /** POST — lister submit (pending until admin approves) */
  createListing(data: Record<string, unknown>): Observable<ListingItem> {
    return this.http.post<ListingItem>(this.apiUrl, data);
  }

  /** PUT — own listing only; approved edits reset to pending */
  updateListing(id: number, data: Record<string, unknown>): Observable<ListingItem> {
    return this.http.put<ListingItem>(`${this.apiUrl}${id}/`, data);
  }

  deleteListing(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  /** POST .../renew/ — after expiry, request new approval period */
  renewListing(id: number): Observable<ListingItem> {
    return this.http.post<ListingItem>(`${this.apiUrl}${id}/renew/`, {});
  }
}
