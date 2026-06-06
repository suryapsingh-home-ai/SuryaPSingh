/**
 * Route guard — blocks seller pages unless seller_token is present.
 * ==================================================================
 * SHELL: redirects to /account/login when not authenticated.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SellerAuthService } from './seller-auth.service';

export const sellerGuard: CanActivateFn = () => {
  const auth = inject(SellerAuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/account/login']);
};
