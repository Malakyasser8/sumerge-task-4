import { Component } from '@angular/core';
import { PendingList } from '../pending-list/pending-list';
import { CompletedList } from '../completed-list/completed-list';
import { ClearAllButton } from '../shared/clear-all-button/clear-all-button';

@Component({
  selector: 'app-todos-list',
  imports: [PendingList, CompletedList, ClearAllButton],
  templateUrl: './todos-list.html',
  styleUrl: './todos-list.css',
})
export class TodosList {}
