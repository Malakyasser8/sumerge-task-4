import { Component, inject } from '@angular/core';
import { PendingList } from '../pending-list/pending-list';
import { CompletedList } from '../completed-list/completed-list';
import { ClearAllButton } from '../shared/clear-all-button/clear-all-button';
import { AuthSerivce } from '../services/auth.service';

@Component({
  selector: 'app-todos-list',
  imports: [PendingList, CompletedList, ClearAllButton],
  templateUrl: './todos-list.html',
  styleUrl: './todos-list.css',
})
export class TodosList {
  authService = inject(AuthSerivce);
  logout() {
    this.authService.logout();
  }
}
