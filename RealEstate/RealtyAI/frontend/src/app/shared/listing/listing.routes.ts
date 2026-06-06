/**
 * Public browse routes — home, list, and detail pages.
 * =====================================================
 * SHELL: paths use LISTING_SCHEMA.id and labels.singular (e.g. /properties, /property/:id).
 */
import { Routes } from '@angular/router';

import { LISTING_SCHEMA, listingDetailSegment } from '../../core/listing.schema';
import { ListingDetailComponent } from './listing-detail.component';
import { ListingHomeComponent } from './listing-home.component';
import { ListingListComponent } from './listing-list.component';

export const listingRoutes: Routes = [
  { path: '', component: ListingListComponent },
  { path: 'home', component: ListingHomeComponent },
  { path: LISTING_SCHEMA.id, component: ListingListComponent },
  { path: `${listingDetailSegment()}/:id`, component: ListingDetailComponent },
];
