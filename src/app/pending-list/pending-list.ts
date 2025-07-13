import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PendingItem } from './pending-item/pending-item';
import { TodosService } from '../todos/todos.service';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-pending-list',
  standalone: true,
  templateUrl: './pending-list.html',
  styleUrl: './pending-list.css',
  imports: [PendingItem, FormsModule],
})
export class PendingList implements OnInit {
  priority = signal<number | undefined>(undefined);
  todoName = signal<string>('');
  searchText = signal<string>('');

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
    const subscription = this.todosService.loadTodos('pending').subscribe({
      complete: () => {
        console.log('Retrieved Pending Todos successfully');
        console.log(this.pendingTodos());
      },
      error: (err: Error) => {
        console.log(err.message);
      },
    });
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

    const subsription = this.todosService
      .insertTodo({
        name: this.todoName(),
        priority: this.priority()!,
        status: 'pending',
      })
      .subscribe({
        complete: () => {
          console.log('Todo is inserted successfully');
        },
        error: (err: Error) => {
          console.log(err.message);
        },
      });

    //reset form by clearing input values and reset everything
    formData.form.reset();
  }
}
