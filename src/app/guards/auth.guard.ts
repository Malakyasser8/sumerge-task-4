import { inject } from '@angular/core';
import { CanMatchFn, RedirectCommand, Router } from '@angular/router';
import { AuthSerivce } from '../services/auth.service';

export const authorizedToLogin: CanMatchFn = (route, segments) => {
  const authService = inject(AuthSerivce);
  if (authService.getCurrentUser()) return true;
  const router = inject(Router);
  return new RedirectCommand(router.parseUrl('./'));
};
