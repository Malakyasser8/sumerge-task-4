import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CompletedItem } from './completed-item/completed-item';
import { TodosService } from '../services/todos.service';
import { FormsModule } from '@angular/forms';
import { Status, Todo } from '../models/todos.model';
import { Spinner } from '../shared/spinner/spinner';

@Component({
  selector: 'app-completed-list',
  imports: [CompletedItem, FormsModule, Spinner],
  templateUrl: './completed-list.html',
  styleUrls: ['./completed-list.css', '../shared/shared-list-container.css'],
})
export class CompletedList implements OnInit {
  isLoading: boolean = false;
  isDragOver: boolean = false;
  errorMessage = '';
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
    this.isLoading = true;
    const subscription = this.todosService
      .loadTodos(Status.Completed)
      .subscribe({
        complete: () => {
          console.log('Retrieved Completed Todos successfully');
          console.log(this.completedTodos());
          this.isLoading = false;
          this.errorMessage = '';
        },
        error: (err: Error) => {
          this.errorMessage =
            'Error retriving completed todos. Please try again later';
          console.log(err.message);
          this.isLoading = false;
        },
      });

    this.ondestoryRef.onDestroy(() => subscription.unsubscribe());
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

    this.isLoading = true;
    const subscription = this.todosService
      .updateTodo({ ...draggedTodo, status: Status.Completed })
      .subscribe({
        complete: () => {
          console.log(
            `Updated data of document id: ${
              draggedTodo.id
            } with data: ${JSON.stringify(JSON.stringify(draggedTodo))}`
          );
          this.errorMessage = '';
          this.isLoading = false;
        },
        error: (err: Error) => {
          this.errorMessage =
            'Error while marking todo as completed. Please try again later';
          console.log(err.message);
          this.isLoading = false;
        },
      });

    this.ondestoryRef.onDestroy(() => subscription.unsubscribe());
  }
}
