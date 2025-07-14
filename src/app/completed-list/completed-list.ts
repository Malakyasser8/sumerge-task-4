import { ErrorComponent } from '../shared/error-component/error-component';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CompletedItem } from './completed-item/completed-item';
import { TodosService } from '../todos/todos.service';
import { FormsModule } from '@angular/forms';
import { Todo } from '../todos/todos.model';
import { Spinner } from '../shared/spinner/spinner';

@Component({
  selector: 'app-completed-list',
  imports: [CompletedItem, FormsModule, ErrorComponent, Spinner],
  templateUrl: './completed-list.html',
  styleUrls: ['./completed-list.css', '../shared/shared-list-container.css'],
})
export class CompletedList implements OnInit {
  isLoading: boolean = false;
  isDragOver: boolean = false;
  errorMessage = signal<string>('');
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
    const subscriber = this.todosService.loadTodos('completed').subscribe({
      complete: () => {
        console.log('Retrieved Completed Todos successfully');
        console.log(this.completedTodos());
        this.isLoading = false;
        this.errorMessage.set('');
      },
      error: (err: Error) => {
        this.errorMessage.set(
          'Error retriving completed todos. Please try again later'
        );
        console.log(err.message);
        this.isLoading = false;
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

    this.isLoading = true;
    const subscriber = this.todosService
      .updateTodo({ ...draggedTodo, status: 'completed' })
      .subscribe({
        complete: () => {
          console.log(
            `Updated data of document id: ${
              draggedTodo.id
            } with data: ${JSON.stringify(JSON.stringify(draggedTodo))}`
          );
          this.errorMessage.set('');
          this.isLoading = false;
        },
        error: (err: Error) => {
          this.errorMessage.set(
            'Error while marking todo as completed. Please try again later'
          );
          console.log(err.message);
          this.isLoading = false;
        },
      });

    this.ondestoryRef.onDestroy(() => subscriber.unsubscribe());
  }
}
