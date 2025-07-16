import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { PendingItem } from './pending-item/pending-item';
import { TodosService } from '../services/todos.service';
import { FormsModule, NgForm } from '@angular/forms';
import { ErrorComponent } from '../shared/error-component/error-component';
import { Spinner } from '../shared/spinner/spinner';

@Component({
  selector: 'app-pending-list',
  standalone: true,
  templateUrl: './pending-list.html',
  styleUrl: '../shared/shared-list-container.css',
  imports: [PendingItem, FormsModule, Spinner, ErrorComponent],
})
export class PendingList implements OnInit {
  isLoading: boolean = false;
  priority = signal<number | undefined>(undefined);
  todoName = signal<string>('');
  searchText = signal<string>('');
  errorMessage = signal<string>('');

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
      complete: () => {
        console.log('Retrieved Pending Todos successfully');
        console.log(this.pendingTodos());
        this.isLoading = false;
        this.errorMessage.set('');
      },
      error: (err: Error) => {
        this.errorMessage.set(
          'Error retriving pending todos. Please try again later'
        );
        console.log(err.message);
        this.isLoading = false;
      },
    });

    this.ondestoryRef.onDestroy(() => subscriber.unsubscribe());
  }

  onSubmit(formData: NgForm) {
    console.log(formData);
    if (formData.form.invalid) {
      if (formData.form.controls['priority'].invalid)
        this.errorMessage.set('Please enter valid priorty value bigger than 0');
      else if (formData.form.controls['todoName'].invalid)
        this.errorMessage.set(
          'Please enter valid todo name wih 1-500 characters'
        );
      return;
    }

    const enteredName: string = formData.form.value.todoName;
    const enteredPriority: number = formData.form.value.priority;
    if (enteredName.trim().length < 1) {
      this.errorMessage.set(
        'Please enter valid todo name wih 1-500 characters'
      );
      return;
    }

    this.errorMessage.set('');
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
          this.errorMessage.set(
            'Error adding new todo. Please try again later'
          );
          console.log(err.message);
          this.isLoading = false;
        },
      });

    this.ondestoryRef.onDestroy(() => subscriber.unsubscribe());

    //reset form by clearing input values and reset everything
    formData.form.reset();
  }
}
