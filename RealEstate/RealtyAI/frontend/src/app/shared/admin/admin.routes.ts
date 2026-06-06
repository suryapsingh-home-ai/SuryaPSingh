/**
 * Admin module routes — login and schema-driven manage paths.
 * ===========================================================
 * SHELL: /admin/{schema.id}, /admin/{schema.id}/new, /admin/{schema.id}/:id/edit
 */
import { Routes } from '@angular/router';

import { LISTING_SCHEMA } from '../../core/listing.schema';
import { adminGuard } from './admin.guard';
import { AdminListingFormComponent } from './admin-listing-form.component';
import { AdminListingsComponent } from './admin-listings.component';
import { AdminLoginComponent } from './admin-login.component';

const manageSegment = LISTING_SCHEMA.id;

export const adminRoutes: Routes = [
  { path: 'admin/login', component: AdminLoginComponent },
  { path: `admin/${manageSegment}`, component: AdminListingsComponent, canActivate: [adminGuard] },
  { path: `admin/${manageSegment}/new`, component: AdminListingFormComponent, canActivate: [adminGuard] },
  { path: `admin/${manageSegment}/:id/edit`, component: AdminListingFormComponent, canActivate: [adminGuard] },
  { path: 'admin', redirectTo: `admin/${manageSegment}`, pathMatch: 'full' },
];
