import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header>
      <div class="container header-inner">
        <h1>RealtyAI</h1>
        <nav>
          <a routerLink="/">Home</a>
          <a routerLink="/listings">Listings</a>
        </nav>
      </div>
    </header>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent {}
