import { Component, DestroyRef, inject, signal } from '@angular/core';
import { TodosService } from '../../services/todos.service';
import { ErrorComponent } from '../error-component/error-component';
import { Spinner } from '../spinner/spinner';

@Component({
  selector: 'app-clear-all-button',
  imports: [ErrorComponent, Spinner],
  templateUrl: './clear-all-button.html',
  styleUrl: './clear-all-button.css',
})
export class ClearAllButton {
  isLoading: boolean = false;
  errorMessage = signal<string>('');
  todosService = inject(TodosService);
  ondestoryRef = inject(DestroyRef);

  deleteAllData() {
    this.isLoading = true;
    const subscriber = this.todosService.deleteAllTodos().subscribe({
      complete: () => {
        console.log('Deleted all todos successfully');
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.errorMessage.set(
          'Error while deleting all Todos. Please try again later'
        );
        console.log(err.message);
      },
    });

    this.ondestoryRef.onDestroy(() => subscriber.unsubscribe());
  }
}
