/**
 * Seller (lister) module routes — register, login, manage listings.
 * =================================================================
 * SHELL: /account/{schema.id}, /account/{schema.id}/new, etc.
 */
import { Routes } from '@angular/router';

import { LISTING_SCHEMA } from '../../core/listing.schema';
import { sellerGuard } from './seller.guard';
import { SellerListingFormComponent } from './seller-listing-form.component';
import { SellerListingsComponent } from './seller-listings.component';
import { SellerLoginComponent } from './seller-login.component';
import { SellerRegisterComponent } from './seller-register.component';

const manageSegment = LISTING_SCHEMA.id;

export const sellerRoutes: Routes = [
  { path: 'account/login', component: SellerLoginComponent },
  { path: 'account/register', component: SellerRegisterComponent },
  { path: `account/${manageSegment}`, component: SellerListingsComponent, canActivate: [sellerGuard] },
  { path: `account/${manageSegment}/new`, component: SellerListingFormComponent, canActivate: [sellerGuard] },
  { path: `account/${manageSegment}/:id/edit`, component: SellerListingFormComponent, canActivate: [sellerGuard] },
  { path: 'account', redirectTo: `account/${manageSegment}`, pathMatch: 'full' },
];
