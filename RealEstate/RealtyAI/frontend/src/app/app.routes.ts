import { Routes } from '@angular/router';
import { ListingListComponent } from './listing-list.component';
import { ListingDetailComponent } from './listing-detail.component';
import { HomeComponent } from './home.component';

export const appRoutes: Routes = [
  { path: '', component: ListingListComponent },
  { path: 'home', component: HomeComponent },
  { path: 'listings', component: ListingListComponent },
  { path: 'listing/:id', component: ListingDetailComponent },
  { path: '**', redirectTo: '' },
];
