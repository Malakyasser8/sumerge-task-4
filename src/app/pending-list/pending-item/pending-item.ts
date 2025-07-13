import { TodosService } from './../../todos/todos.service';
import { Component, Input, signal, inject } from '@angular/core';
import { Todo } from '../../todos/todos.model';

@Component({
  selector: 'app-pending-item',
  imports: [],
  templateUrl: './pending-item.html',
  styleUrl: './pending-item.css',
})
export class PendingItem {
  @Input({ required: true }) pendingTodo!: Todo;
  selectedItem = signal<PendingItem | undefined>(undefined);
  todosService = inject(TodosService);

  dragStart(element: PendingItem) {
    this.selectedItem.set(element);
  }

  addTodoToCompletedList() {
    const subscription = this.todosService
      .updateTodo({ ...this.pendingTodo, status: 'completed' })
      .subscribe({
        complete: () => {
          console.log(
            `Updated data of document id: ${
              this.pendingTodo.id
            } with data: ${JSON.stringify(JSON.stringify(this.pendingTodo))}`
          );
        },
        error: (err: Error) => {
          console.log(err.message);
        },
      });
  }
}
