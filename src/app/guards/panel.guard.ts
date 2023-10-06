import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

export function PanelGuard(state: RouterStateSnapshot) {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  if (token !== null) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
}
