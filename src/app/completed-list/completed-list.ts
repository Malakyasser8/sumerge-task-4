import { Component, computed, inject, signal } from '@angular/core';
import { PendingItem } from '../pending-list/pending-item/pending-item';
import { CompletedItem } from './completed-item/completed-item';
import { TodosService } from '../todos/todos.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-completed-list',
  imports: [CompletedItem, FormsModule],
  templateUrl: './completed-list.html',
  styleUrl: './completed-list.css',
})
export class CompletedList {
  isDragOver: boolean = false;
  searchText = signal<string>('');

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
    const subscription = this.todosService.loadTodos('completed').subscribe({
      complete: () => {
        console.log('Retrieved Completed Todos successfully');
        console.log(this.completedTodos());
      },
      error: (err: Error) => {
        console.log(err.message);
      },
    });
  }

  dragOver() {
    this.isDragOver = true;
  }
  dragleave() {
    this.isDragOver = false;
  }
  drop() {
    this.isDragOver = false;
    // if (selectedItem) {
    //   addTodoToCompletedList(selectedItem.querySelector('input'));
    //   selectedItem = null;
    // }
  }
}
