import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Listing } from './listing';
import { environment } from '../environments/environment';

export interface ListingFilters {
  search?: string;
  city?: string;
  state?: string;
  property_type?: string;
  status?: string;
  bedrooms_min?: number;
  bedrooms_max?: number;
  bathrooms_min?: number;
  bathrooms_max?: number;
  price_min?: number;
  price_max?: number;
  area_sqft_min?: number;
  area_sqft_max?: number;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface PaginatedListings {
  count: number;
  next: string | null;
  previous: string | null;
  results: Listing[];
}

@Injectable({ providedIn: 'root' })
export class ListingService {
  private apiUrl = `${environment.apiBaseUrl}/listings/`;

  constructor(private http: HttpClient) {}

  getListings(filters: ListingFilters = {}): Observable<PaginatedListings> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.city) params = params.set('city', filters.city);
    if (filters.state) params = params.set('state', filters.state);
    if (filters.property_type) params = params.set('property_type', filters.property_type);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.bedrooms_min) params = params.set('bedrooms__gte', filters.bedrooms_min);
    if (filters.bedrooms_max) params = params.set('bedrooms__lte', filters.bedrooms_max);
    if (filters.bathrooms_min) params = params.set('bathrooms__gte', filters.bathrooms_min);
    if (filters.bathrooms_max) params = params.set('bathrooms__lte', filters.bathrooms_max);
    if (filters.price_min) params = params.set('price__gte', filters.price_min);
    if (filters.price_max) params = params.set('price__lte', filters.price_max);
    if (filters.area_sqft_min) params = params.set('area_sqft__gte', filters.area_sqft_min);
    if (filters.area_sqft_max) params = params.set('area_sqft__lte', filters.area_sqft_max);
    if (filters.page) params = params.set('page', filters.page);
    if (filters.page_size) params = params.set('page_size', filters.page_size);
    if (filters.ordering) params = params.set('ordering', filters.ordering);
    return this.http.get<PaginatedListings>(this.apiUrl, { params });
  }

  getListing(id: number): Observable<Listing> {
    return this.http.get<Listing>(`${this.apiUrl}${id}/`);
  }
}
