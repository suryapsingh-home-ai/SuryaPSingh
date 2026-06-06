/**
 * App bootstrap — wires router, HTTP client, and auth interceptor.
 * =================================================================
 * SHELL: entry point for Angular. authInterceptor attaches admin or seller token.
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app.routes';
import { provideHttpClient, withInterceptors, withJsonpSupport } from '@angular/common/http';

import { authInterceptor } from './app/shared/admin/admin-auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withJsonpSupport(), withInterceptors([authInterceptor])),
  ],
}).catch(err => console.error(err));
