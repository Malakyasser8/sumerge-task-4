import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { PendingItem } from './pending-item/pending-item';
import { TodosService } from '../todos/todos.service';
import { FormsModule, NgForm } from '@angular/forms';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-pending-list',
  standalone: true,
  templateUrl: './pending-list.html',
  styleUrl: './pending-list.css',
  imports: [PendingItem, FormsModule, MatProgressSpinner],
})
export class PendingList implements OnInit {
  isLoading: boolean = false;
  priority = signal<number | undefined>(undefined);
  todoName = signal<string>('');
  searchText = signal<string>('');

  ondestoryRef = inject(DestroyRef);
  todosService = inject(TodosService);

  pendingTodos = this.todosService.loadedPendingTodos;
  filteredPendingTodos = computed(() =>
    this.todosService
      .loadedPendingTodos()
      .filter((todo) =>
        todo.name.toLowerCase().includes(this.searchText().toLowerCase())
      )
  );

  ngOnInit(): void {
    this.isLoading = true;
    const subscriber = this.todosService.loadTodos('pending').subscribe({
      next: (val) => console.log(val),
      complete: () => {
        console.log('Retrieved Pending Todos successfully');
        console.log(this.pendingTodos());
        this.isLoading = false;
      },
      error: (err: Error) => {
        console.log(err.message);
      },
    });

    this.ondestoryRef.onDestroy(() => subscriber.unsubscribe());
  }

  onSubmit(formData: NgForm) {
    if (formData.form.invalid) {
      return;
    }

    const enteredName = formData.form.value.todoName;
    const enteredPriority = formData.form.value.priority;

    console.log(formData);
    console.log(enteredName);
    console.log(enteredPriority);

    this.isLoading = true;
    const subscriber = this.todosService
      .insertTodo({
        name: this.todoName(),
        priority: this.priority()!,
        status: 'pending',
      })
      .subscribe({
        complete: () => {
          console.log('Todo is inserted successfully');
          this.isLoading = false;
        },
        error: (err: Error) => {
          console.log(err.message);
        },
      });

    this.ondestoryRef.onDestroy(() => subscriber.unsubscribe());

    //reset form by clearing input values and reset everything
    formData.form.reset();
  }
}
