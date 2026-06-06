/**
 * HTTP interceptor — attaches admin or seller Token header to API requests.
 * ==========================================================================
 * SHELL: registered in main.ts; checks admin_token then seller_token in localStorage.
 */
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('seller_token');
  if (token) {
    return next(
      req.clone({
        setHeaders: { Authorization: `Token ${token}` },
      })
    );
  }
  return next(req);
};
