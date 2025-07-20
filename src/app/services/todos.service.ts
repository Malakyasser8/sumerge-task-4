import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, map, throwError, timeout } from 'rxjs';
import { Status, Todo, TodoInsertBody } from '../models/todos.model';
import { AuthSerivce } from './auth.service';
import {
  LoadTodosResponseData,
  TodoResponseData,
} from '../models/response.model';

@Injectable({
  providedIn: 'root',
})
export class TodosService {
  private httpClient = inject(HttpClient);
  private authService = inject(AuthSerivce);
  private pendingTodos = signal<Todo[]>([]);
  private completedTodos = signal<Todo[]>([]);
  baseUrl = `https://firestore.googleapis.com/v1beta1/projects/sumerge-task-3-todo-list/databases/(default)/documents/todos`;
  timeoutTime: number = 10000;

  loadedPendingTodos = this.pendingTodos.asReadonly();
  loadedCompletedTodos = this.completedTodos.asReadonly();

  loadTodos(requiredStatus: Status) {
    return this.httpClient
      .get<any>(this.baseUrl, {
        headers: {
          Authorization: `Bearer ${
            this.authService.getCurrentUser()?.accessToken
          }`,
        },
      })
      .pipe(
        timeout(this.timeoutTime),
        map((resData) => {
          this.mapAndSetLoadedTodos(resData);
          return requiredStatus == Status.Pending
            ? this.pendingTodos
            : this.completedTodos;
        }),
        catchError((error) => {
          console.error('Error loading todos:', error.message);
          return throwError(() => new Error(error.message));
        })
      );
  }

  deleteTodo(id: string) {
    return this.httpClient
      .delete(`${this.baseUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${
            this.authService.getCurrentUser()?.accessToken
          }`,
        },
      })
      .pipe(
        timeout(this.timeoutTime),
        catchError((error) => {
          console.error('Error deleting todo:', error.message);
          return throwError(() => new Error(error.message));
        })
      );
  }

  deleteAllTodos() {
    const allTodos = [...this.pendingTodos(), ...this.completedTodos()];
    const deleteCalls = allTodos.map((todo) => this.deleteTodo(todo.id));

    return forkJoin(deleteCalls).pipe(
      timeout(this.timeoutTime),
      map(() => {
        this.pendingTodos.set([]);
        this.completedTodos.set([]);
      }),
      catchError((error) => {
        console.error('Error deleting all todos:', error.message);
        return throwError(() => new Error(error.message));
      })
    );
  }

  insertTodo(todoInsertBody: TodoInsertBody) {
    return this.httpClient
      .post<TodoResponseData>(
        this.baseUrl,
        JSON.stringify({
          fields: {
            name: { stringValue: todoInsertBody.name },
            priority: { integerValue: String(todoInsertBody.priority) },
            status: { stringValue: todoInsertBody.status },
            userId: { stringValue: this.authService.getCurrentUser()?.id },
          },
        }),
        {
          headers: {
            Authorization: `Bearer ${
              this.authService.getCurrentUser()?.accessToken
            }`,
          },
        }
      )
      .pipe(
        timeout(this.timeoutTime),
        map((response: TodoResponseData) => {
          console.log(response);
          const newTodo = this.sortNewTodos(response, todoInsertBody);
          return newTodo;
        }),
        catchError((error) => {
          console.error('Error inserting todo:', error.message);
          return throwError(() => new Error(error.message));
        })
      );
  }

  updateTodo(updatedTodo: Todo) {
    return this.httpClient
      .patch(
        `${this.baseUrl}/${updatedTodo.id}?updateMask.fieldPaths=status`,
        JSON.stringify({
          fields: {
            status: { stringValue: updatedTodo.status },
          },
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${
              this.authService.getCurrentUser()?.accessToken
            }`,
          },
        }
      )
      .pipe(
        timeout(this.timeoutTime),
        map(() => {
          this.pendingTodos.set(
            this.pendingTodos().filter((todo) => todo.id != updatedTodo.id)
          );
          this.completedTodos.set([updatedTodo, ...this.completedTodos()]);
        }),
        catchError((error) => {
          console.error('Error updating todo:', error.message);
          return throwError(() => new Error(error.message));
        })
      );
  }

  private filterTodos(todos: Todo[], status: Status) {
    const filtered = todos
      .filter(
        (todo: Todo) => todo.userId == this.authService.getCurrentUser()?.id
      )
      .filter((todo: Todo) => todo.status == status);

    return filtered;
  }

  private mapAndSetLoadedTodos(response: LoadTodosResponseData) {
    console.log(response);
    const docs = response.documents || [];

    const formatedDocs = docs
      .map((doc: TodoResponseData) => {
        const fields = doc.fields || {};
        return {
          id: doc.name?.split('/').pop(),
          name: fields.name?.stringValue,
          priority: parseInt(fields.priority?.integerValue, 10),
          status: fields.status?.stringValue,
          userId: fields.userId?.stringValue,
        } as Todo;
      })
      .sort((a: Todo, b: Todo) => a.priority - b.priority);

    this.pendingTodos.set(this.filterTodos(formatedDocs, Status.Pending));
    this.completedTodos.set(this.filterTodos(formatedDocs, Status.Completed));
  }

  private sortNewTodos(
    response: TodoResponseData,
    todoInsertBody: TodoInsertBody
  ) {
    const newTodo: Todo = {
      id: response.name.split('/').pop() || '',
      userId: this.authService.getCurrentUser()?.id!,
      ...todoInsertBody,
    };

    const current = [...this.pendingTodos()];
    let inserted = false;

    for (let i = 0; i < current.length; i++) {
      if (newTodo.priority < current[i].priority) {
        current.splice(i, 0, newTodo);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      current.push(newTodo);
    }

    this.pendingTodos.set(current);

    return newTodo;
  }
}
