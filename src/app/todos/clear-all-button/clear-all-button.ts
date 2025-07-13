import { TodosService } from './../todos.service';
import { Component, DestroyRef, inject } from '@angular/core';

@Component({
  selector: 'app-clear-all-button',
  imports: [],
  templateUrl: './clear-all-button.html',
  styleUrl: './clear-all-button.css',
})
export class ClearAllButton {
  todosService = inject(TodosService);
  ondestoryRef = inject(DestroyRef);

  deleteAllData() {
    const subscriber = this.todosService.deleteAllTodos().subscribe({
      complete: () => console.log('Deleted all todos successfully'),
      error: (err: Error) => {
        console.log(err.message);
      },
    });

    this.ondestoryRef.onDestroy(() => subscriber.unsubscribe());
  }
}
