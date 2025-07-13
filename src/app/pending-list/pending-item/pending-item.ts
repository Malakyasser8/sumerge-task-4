import { TodosService } from './../../todos/todos.service';
import { Component, Input, signal, inject, DestroyRef } from '@angular/core';
import { Todo } from '../../todos/todos.model';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-pending-item',
  imports: [MatProgressSpinner],
  templateUrl: './pending-item.html',
  styleUrl: './pending-item.css',
})
export class PendingItem {
  @Input({ required: true }) pendingTodo!: Todo;
  isLoading: boolean = false;
  todosService = inject(TodosService);
  ondestoryRef = inject(DestroyRef);

  dragStart(event: DragEvent) {
    const data = JSON.stringify(this.pendingTodo);
    event.dataTransfer?.setData('application/json', data);
  }

  addTodoToCompletedList() {
    this.isLoading = true;
    const subscriber = this.todosService
      .updateTodo({ ...this.pendingTodo, status: 'completed' })
      .subscribe({
        complete: () => {
          console.log(
            `Updated data of document id: ${
              this.pendingTodo.id
            } with data: ${JSON.stringify(JSON.stringify(this.pendingTodo))}`
          );
          this.isLoading = false;
        },
        error: (err: Error) => {
          console.log(err.message);
        },
      });

    this.ondestoryRef.onDestroy(() => subscriber.unsubscribe());
  }
}
