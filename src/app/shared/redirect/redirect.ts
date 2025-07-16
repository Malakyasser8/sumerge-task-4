import { Component, inject } from '@angular/core';
import { AuthSerivce } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redirect',
  imports: [],
  template: ``,
})
export class Redirect {
  private authService = inject(AuthSerivce);
  private router = inject(Router);

  ngOnInit() {
    const isLoggedIn = this.authService.getCurrentUser()?.id;
    this.router.navigateByUrl(isLoggedIn ? '/todos' : '');
  }
}
