import { Component, DestroyRef, inject, signal } from '@angular/core';
import { TodosService } from '../../services/todos.service';
import { Spinner } from '../spinner/spinner';

@Component({
  selector: 'app-clear-all-button',
  imports: [ Spinner],
  templateUrl: './clear-all-button.html',
  styleUrl: './clear-all-button.css',
})
export class ClearAllButton {
  isLoading: boolean = false;
  errorMessage =''
  todosService = inject(TodosService);
  ondestoryRef = inject(DestroyRef);

  deleteAllData() {
    this.isLoading = true;
    const subscription = this.todosService.deleteAllTodos().subscribe({
      complete: () => {
        console.log('Deleted all todos successfully');
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.errorMessage=
          'Error while deleting all Todos. Please try again later'
        console.log(err.message);
      },
    });

    this.ondestoryRef.onDestroy(() => subscription.unsubscribe());
  }
}
