/**
 * Top-level Angular routes — merges public, seller, and admin route modules.
 * ===========================================================================
 * SHELL: each submodule reads LISTING_SCHEMA.id for path segments.
 */
import { Routes } from '@angular/router';

import { adminRoutes } from './shared/admin/admin.routes';
import { sellerRoutes } from './shared/seller/seller.routes';
import { listingRoutes } from './shared/listing/listing.routes';

export const appRoutes: Routes = [
  ...listingRoutes,
  ...sellerRoutes,
  ...adminRoutes,
  { path: '**', redirectTo: '' },
];
