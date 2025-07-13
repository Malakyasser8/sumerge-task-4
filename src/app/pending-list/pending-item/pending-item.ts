import { TodosService } from './../../todos/todos.service';
import { Component, Input, signal, inject, DestroyRef } from '@angular/core';
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
  ondestoryRef = inject(DestroyRef);

  dragStart(element: PendingItem) {
    this.selectedItem.set(element);
  }

  addTodoToCompletedList() {
    const subscriber = this.todosService
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

    this.ondestoryRef.onDestroy(() => subscriber.unsubscribe());
  }
}
