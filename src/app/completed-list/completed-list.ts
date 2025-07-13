import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { PendingItem } from '../pending-list/pending-item/pending-item';
import { CompletedItem } from './completed-item/completed-item';
import { TodosService } from '../todos/todos.service';
import { FormsModule } from '@angular/forms';
import { Todo } from '../todos/todos.model';

@Component({
  selector: 'app-completed-list',
  imports: [CompletedItem, FormsModule],
  templateUrl: './completed-list.html',
  styleUrl: './completed-list.css',
})
export class CompletedList {
  isDragOver: boolean = false;
  searchText = signal<string>('');

  ondestoryRef = inject(DestroyRef);
  todosService = inject(TodosService);

  completedTodos = this.todosService.loadedCompletedTodos;
  filteredCompletedTodos = computed(() =>
    this.todosService
      .loadedCompletedTodos()
      .filter((todo) =>
        todo.name.toLowerCase().includes(this.searchText().toLowerCase())
      )
  );

  ngOnInit(): void {
    const subscriber = this.todosService.loadTodos('completed').subscribe({
      complete: () => {
        console.log('Retrieved Completed Todos successfully');
        console.log(this.completedTodos());
      },
      error: (err: Error) => {
        console.log(err.message);
      },
    });

    this.ondestoryRef.onDestroy(() => subscriber.unsubscribe());
  }

  dragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }
  dragleave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }
  drop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    const data = event.dataTransfer?.getData('application/json');
    if (!data) return;

    const draggedTodo: Todo = JSON.parse(data);
    console.log('Dropped todo:', draggedTodo);

    const subscriber = this.todosService
      .updateTodo({ ...draggedTodo, status: 'completed' })
      .subscribe({
        complete: () => {
          console.log(
            `Updated data of document id: ${
              draggedTodo.id
            } with data: ${JSON.stringify(JSON.stringify(draggedTodo))}`
          );
        },
        error: (err: Error) => {
          console.log(err.message);
        },
      });

    this.ondestoryRef.onDestroy(() => subscriber.unsubscribe());
  }
}
