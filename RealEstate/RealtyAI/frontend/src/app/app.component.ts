/**
 * Root layout — header nav and router outlet.
 * ===========================================
 * SHELL: product name and nav labels come from LISTING_SCHEMA.
 * Routes render in <router-outlet> from app.routes.ts.
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

import { LISTING_SCHEMA, listingListPath } from './core/listing.schema';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <header>
      <div class="container header-inner">
        <h1>{{ schema.product_name }}</h1>
        <nav>
          <a routerLink="/home">Home</a>
          <a [routerLink]="listPath">{{ schema.labels.plural }}</a>
          <a routerLink="/account/login">List {{ schema.labels.singular }}</a>
          <a routerLink="/admin/login">Admin</a>
        </nav>
      </div>
    </header>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent {
  readonly schema = LISTING_SCHEMA;
  readonly listPath = listingListPath();
}
