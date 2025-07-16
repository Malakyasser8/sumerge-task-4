import { TodosService } from '../../services/todos.service';
import { Component, Input, signal, inject, DestroyRef } from '@angular/core';
import { Todo } from '../../models/todos.model';
import { ErrorComponent } from '../../shared/error-component/error-component';
import { Spinner } from '../../shared/spinner/spinner';

@Component({
  selector: 'app-pending-item',
  imports: [ErrorComponent, Spinner],
  templateUrl: './pending-item.html',
  styleUrl: './pending-item.css',
})
export class PendingItem {
  @Input({ required: true }) pendingTodo!: Todo;
  errorMessage = signal<string>('');
  checkboxChecked = false;
  isLoading: boolean = false;
  todosService = inject(TodosService);
  ondestoryRef = inject(DestroyRef);

  dragStart(event: DragEvent) {
    const data = JSON.stringify(this.pendingTodo);
    event.dataTransfer?.setData('application/json', data);
  }

  onCheckboxChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.checkboxChecked = input.checked; // update checkbox signal

    if (input.checked) {
      this.addTodoToCompletedList();
    }
  }

  addTodoToCompletedList() {
    this.isLoading = true;
    const subscription = this.todosService
      .updateTodo({ ...this.pendingTodo, status: 'completed' })
      .subscribe({
        complete: () => {
          console.log(
            `Updated data of document id: ${
              this.pendingTodo.id
            } with data: ${JSON.stringify(JSON.stringify(this.pendingTodo))}`
          );
          this.isLoading = false;
          this.errorMessage.set('');
        },
        error: (err: Error) => {
          this.errorMessage.set(
            'Error while marking todo as completed. Please try again later'
          );
          console.log(err.message);
          this.checkboxChecked = false;
          this.isLoading = false;
        },
      });

    this.ondestoryRef.onDestroy(() => subscription.unsubscribe());
  }
}
