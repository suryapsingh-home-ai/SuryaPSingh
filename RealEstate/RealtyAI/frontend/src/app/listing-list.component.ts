import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ListingService, ListingFilters, PaginatedListings } from './listing.service';
import { Listing } from './listing';

@Component({
  selector: 'app-listing-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './listing-list.component.html',
})
export class ListingListComponent implements OnInit {
  paginatedData: PaginatedListings = { count: 0, next: null, previous: null, results: [] };
  loading = false;
  sidebarOpen = true;
  showAdvancedFilters = false;
  
  filters: ListingFilters = {
    page: 1,
    page_size: 12,
    ordering: '-created_at'
  };

  currentPage = 1;
  totalPages = 1;
  currentCity = '';
  detectingLocation = false;

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
    this.detectLocation();
  }

  detectLocation(): void {
    if (navigator.geolocation) {
      this.detectingLocation = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.reverseGeocode(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          this.detectingLocation = false;
          this.loadListings();
        }
      );
    } else {
      this.loadListings();
    }
  }

  reverseGeocode(lat: number, lon: number): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
      .then(response => response.json())
      .then(data => {
        if (data.address && data.address.city) {
          this.currentCity = data.address.city;
          this.filters.city = this.currentCity;
        } else if (data.address && data.address.town) {
          this.currentCity = data.address.town;
          this.filters.city = this.currentCity;
        }
        this.detectingLocation = false;
        this.loadListings();
      })
      .catch(error => {
        console.error('Reverse geocoding error:', error);
        this.detectingLocation = false;
        this.loadListings();
      });
  }

  onCityChange(city: string): void {
    this.currentCity = city;
    this.filters.city = city || undefined;
    this.onFilterChange();
  }

  loadListings(): void {
    this.loading = true;
    this.listingService.getListings(this.filters).subscribe({
      next: data => {
        this.paginatedData = data;
        this.totalPages = Math.ceil(data.count / (this.filters.page_size || 12));
        this.loading = false;
      },
      error: () => {
        this.paginatedData = { count: 0, next: null, previous: null, results: [] };
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.filters.page = 1;
    this.loadListings();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.filters.page = 1;
    this.loadListings();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  previousPage(): void {
    if (this.paginatedData.previous && this.currentPage > 1) {
      this.currentPage--;
      this.filters.page = this.currentPage;
      this.loadListings();
    }
  }

  nextPage(): void {
    if (this.paginatedData.next) {
      this.currentPage++;
      this.filters.page = this.currentPage;
      this.loadListings();
    }
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.search ||
      this.filters.city ||
      this.filters.property_type ||
      this.filters.price_min ||
      this.filters.price_max ||
      this.filters.bedrooms_min ||
      this.filters.bedrooms_max ||
      this.filters.bathrooms_min ||
      this.filters.bathrooms_max ||
      this.filters.area_sqft_min ||
      this.filters.area_sqft_max
    );
  }

  clearFilter(filter: string): void {
    if (filter === 'search') this.filters.search = undefined;
    if (filter === 'city') {
      this.filters.city = undefined;
      this.currentCity = '';
    }
    if (filter === 'property_type') this.filters.property_type = undefined;
    this.onFilterChange();
  }

  clearPriceFilter(): void {
    this.filters.price_min = undefined;
    this.filters.price_max = undefined;
    this.onFilterChange();
  }

  clearBedroomsFilter(): void {
    this.filters.bedrooms_min = undefined;
    this.filters.bedrooms_max = undefined;
    this.onFilterChange();
  }

  clearBathroomsFilter(): void {
    this.filters.bathrooms_min = undefined;
    this.filters.bathrooms_max = undefined;
    this.onFilterChange();
  }

  clearAreaFilter(): void {
    this.filters.area_sqft_min = undefined;
    this.filters.area_sqft_max = undefined;
    this.onFilterChange();
  }

  clearAllFilters(): void {
    this.currentCity = '';
    this.filters = {
      page: 1,
      page_size: 12,
      ordering: '-created_at'
    };
    this.onFilterChange();
  }
}
