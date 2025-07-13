import { Component, inject } from '@angular/core';
import { PendingItem } from '../pending-list/pending-item/pending-item';
import { CompletedItem } from './completed-item/completed-item';
import { TodosService } from '../todos/todos.service';

@Component({
  selector: 'app-completed-list',
  imports: [CompletedItem],
  templateUrl: './completed-list.html',
  styleUrl: './completed-list.css',
})
export class CompletedList {
  isDragOver: boolean = false;

  todosService = inject(TodosService);
  completedTodos = this.todosService.loadedCompletedTodos;

  ngOnInit(): void {
    const subscription = this.todosService.loadTodos('completed').subscribe({
      complete: () => {
        console.log('Retrieved Completed Todos successfully');
        console.log(this.completedTodos());
      },
      error: (err: Error) => {
        console.log(err.message);
      },
    });
  }

  dragOver() {
    this.isDragOver = true;
  }
  dragleave() {
    this.isDragOver = false;
  }
  drop() {
    this.isDragOver = false;
    // if (selectedItem) {
    //   addTodoToCompletedList(selectedItem.querySelector('input'));
    //   selectedItem = null;
    // }
  }
}
