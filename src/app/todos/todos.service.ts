import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, map, throwError } from 'rxjs';
import { Status, Todo, TodoInsertBody } from './todos.model';

@Injectable({
  providedIn: 'root',
})
export class TodosService {
  private httpClient = inject(HttpClient);
  private pendingTodos = signal<Todo[]>([]);
  private completedTodos = signal<Todo[]>([]);
  baseUrl = `https://firestore.googleapis.com/v1beta1/projects/sumerge-task-3-todo-list/databases/(default)/documents/todos`;

  loadedPendingTodos = this.pendingTodos.asReadonly();
  loadedCompletedTodos = this.completedTodos.asReadonly();

  loadTodos(requiredStatus: Status) {
    return this.httpClient.get<any>(this.baseUrl).pipe(
      map((resData) => {
        const docs = resData.documents || [];

        const formatedDocs = docs
          .map((doc: any) => {
            const fields = doc.fields || {};
            return {
              id: doc.name?.split('/').pop(),
              name: fields.name?.stringValue,
              priority: parseInt(fields.priority?.integerValue, 10),
              status: fields.status?.stringValue,
            } as Todo;
          })
          .sort((a: Todo, b: Todo) => a.priority - b.priority);

        this.pendingTodos.set(
          formatedDocs.filter((todo: Todo) => todo.status == 'pending')
        );
        this.completedTodos.set(
          formatedDocs.filter((todo: Todo) => todo.status == 'completed')
        );

        return formatedDocs.filter(
          (todo: Todo) => todo.status == requiredStatus
        );
      }),
      catchError((error) => {
        console.error('Error loading todos:', error.message);
        return throwError(() => new Error(error.message));
      })
    );
  }

  deleteTodo(id: string) {
    return this.httpClient.delete(`${this.baseUrl}/${id}`).pipe(
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
      .post(
        this.baseUrl,
        JSON.stringify({
          fields: {
            name: { stringValue: todoInsertBody.name },
            priority: { integerValue: String(todoInsertBody.priority) },
            status: { stringValue: todoInsertBody.status },
          },
        })
      )
      .pipe(
        map((response: any) => {
          const newTodo: Todo = {
            id: response.name.split('/').pop(),
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
            status: { stringValue: status },
          },
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .pipe(
        map((reponse: any) => {
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
}
