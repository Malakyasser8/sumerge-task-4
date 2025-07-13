import { Component, ViewEncapsulation } from '@angular/core';
import { PendingList } from './pending-list/pending-list';
import { CompletedList } from "./completed-list/completed-list";
import { ClearAllButton } from "./todos/clear-all-button/clear-all-button";

@Component({
  selector: 'app-root',
  imports: [PendingList, CompletedList, ClearAllButton],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'todo-list-angular';
}
