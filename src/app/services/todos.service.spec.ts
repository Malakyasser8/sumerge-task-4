import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { TodosService } from './todos.service';
import { Status, Todo, TodoInsertBody } from '../models/todos.model';
import { of, throwError } from 'rxjs';
import { AuthSerivce } from './auth.service';

describe('Todos', () => {
  let service: TodosService;
  let mockHttpClient: jasmine.SpyObj<HttpClient>;
  let mockAuthService: any;

  const mockUser = {
    id: 'user123',
    accessToken: 'fake-token',
  };

  const mockTodos: Todo[] = [
    {
      id: '1',
      name: 'Test A',
      priority: 1,
      status: Status.Pending,
      userId: 'user123',
    },
    {
      id: '2',
      name: 'Test B',
      priority: 2,
      status: Status.Completed,
      userId: 'user123',
    },
  ];

  const mockFirebaseResponse = {
    documents: [
      {
        name: 'projects/x/databases/(default)/documents/todos/1',
        fields: {
          name: { stringValue: 'Test A' },
          priority: { integerValue: '1' },
          status: { stringValue: Status.Pending },
          userId: { stringValue: 'user123' },
        },
      },
      {
        name: 'projects/x/databases/(default)/documents/todos/2',
        fields: {
          name: { stringValue: 'Test B' },
          priority: { integerValue: '2' },
          status: { stringValue: Status.Completed },
          userId: { stringValue: 'user123' },
        },
      },
    ],
  };

  beforeEach(() => {
    mockHttpClient = jasmine.createSpyObj('HttpClient', [
      'get',
      'post',
      'delete',
      'patch',
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockAuthService.getCurrentUser.and.returnValue(mockUser);

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: AuthSerivce, useValue: mockAuthService },
      ],
    });

    service = TestBed.inject(TodosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load todos and filter them by status', (done) => {
    mockHttpClient.get.and.returnValue(of(mockFirebaseResponse));

    service.loadTodos(Status.Pending).subscribe((signal) => {
      const pending = signal();
      expect(pending.length).toBe(1);
      expect(pending[0].status).toBe(Status.Pending);
      done();
    });
  });

  it('should throw an error if HTTP request fails', (done) => {
    mockHttpClient.get.and.returnValue(
      throwError(() => new Error('Load failed'))
    );

    service.loadTodos(Status.Pending).subscribe({
      error: (err) => {
        expect(err.message).toBe('Load failed');
        done();
      },
    });
  });

  it('should insert a todo and sort it by priority', (done) => {
    const insertBody: TodoInsertBody = {
      name: 'Inserted Task',
      priority: 0,
      status: Status.Pending,
    };

    const mockResponse = {
      name: 'projects/x/databases/(default)/documents/todos/123',
    };

    mockHttpClient.post.and.returnValue(of(mockResponse));

    service.insertTodo(insertBody).subscribe((newTodo) => {
      expect(newTodo.name).toBe(insertBody.name);
      expect(newTodo.priority).toBe(insertBody.priority);
      done();
    });
  });

  it('should call delete with the correct ID', (done) => {
    mockHttpClient.delete.and.returnValue(of({}));

    service.deleteTodo('1').subscribe(() => {
      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        jasmine.stringMatching(/\/1$/),
        jasmine.any(Object)
      );
      done();
    });
  });

  it('should delete all todos and clear the signals', (done) => {
    mockHttpClient.delete.and.returnValue(of({}));

    service['pendingTodos'].set([mockTodos[0]]);
    service['completedTodos'].set([mockTodos[1]]);

    service.deleteAllTodos().subscribe(() => {
      expect(service['pendingTodos']()).toEqual([]);
      expect(service['completedTodos']()).toEqual([]);
      done();
    });
  });

  it('should update a todo status and move it to completed', (done) => {
    const updatedTodo: Todo = {
      ...mockTodos[0],
      status: Status.Completed,
    };

    mockHttpClient.patch.and.returnValue(of({}));

    service['pendingTodos'].set([mockTodos[0]]);
    service['completedTodos'].set([]);

    service.updateTodo(updatedTodo).subscribe(() => {
      const pending = service['pendingTodos']();
      const completed = service['completedTodos']();
      expect(pending.length).toBe(0);
      expect(completed.length).toBe(1);
      expect(completed[0].id).toBe(updatedTodo.id);
      done();
    });
  });
});
