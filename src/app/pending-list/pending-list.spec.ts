import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { NgForm } from '@angular/forms';

import { PendingList } from './pending-list';
import { TodosService } from '../services/todos.service';
import { Status, Todo } from '../models/todos.model';

describe('PendingList', () => {
  let component: PendingList;
  let fixture: ComponentFixture<PendingList>;
  let mockHttpClient: jasmine.SpyObj<HttpClient>;
  let mockTodosService: any;

  const mockPendingTodos: Todo[] = [
    {
      id: '1',
      userId: '1',
      name: 'Task One',
      priority: 1,
      status: Status.Pending,
    },
    {
      id: '2',
      userId: '1',
      name: 'Another Task',
      priority: 2,
      status: Status.Pending,
    },
    {
      id: '3',
      userId: '1',
      name: 'Important Task',
      priority: 3,
      status: Status.Pending,
    },
  ];

  beforeEach(async () => {
    mockTodosService = jasmine.createSpyObj('TodosService', [
      'loadTodos',
      'insertTodo',
    ]);
    mockTodosService.loadTodos.and.returnValue(of(signal(mockPendingTodos)));
    mockTodosService.loadedPendingTodos = signal(mockPendingTodos);
    mockHttpClient = jasmine.createSpyObj('HttpClient', ['post']);

    await TestBed.configureTestingModule({
      imports: [PendingList],
      providers: [
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: TodosService, useValue: mockTodosService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isLoading to true initially on ngOnInit', () => {
    let isLoadingDuringCall = false;

    mockTodosService.loadTodos.and.callFake(() => {
      isLoadingDuringCall = component.isLoading;
      return of(signal([]));
    });

    component.ngOnInit();

    expect(isLoadingDuringCall).toBe(true);
  });

  it('should call loadTodos with "pending" status on ngOnInit', () => {
    component.ngOnInit();
    expect(mockTodosService.loadTodos).toHaveBeenCalledWith(Status.Pending);
  });

  it('should set isLoading to false on successful load', () => {
    component.ngOnInit();
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('');
  });

  it('should handle load error in ngOnInit', () => {
    const errorMessage = 'Network error';
    mockTodosService.loadTodos.and.returnValue(
      throwError(() => new Error(errorMessage))
    );

    component.ngOnInit();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe(
      'Error retriving pending todos. Please try again later'
    );
  });

  it('should return all todos when search text is empty', () => {
    fixture.detectChanges();
    component.searchText.set('');

    expect(component.filteredPendingTodos()).toEqual(mockPendingTodos);
  });

  it('should filter todos by name (case insensitive)', () => {
    fixture.detectChanges();
    component.searchText.set('task');

    const filtered = component.filteredPendingTodos();
    expect(filtered).toHaveSize(3);
    expect(filtered[0].name).toBe('Task One');
    expect(filtered[1].name).toBe('Another Task');
    expect(filtered[2].name).toBe('Important Task');
  });

  it('should filter todos by partial name match', () => {
    fixture.detectChanges();
    component.searchText.set('important');

    const filtered = component.filteredPendingTodos();
    expect(filtered).toHaveSize(1);
    expect(filtered[0].name).toBe('Important Task');
  });

  it('should return empty array when no todos match search', () => {
    fixture.detectChanges();
    component.searchText.set('nonexistent');

    expect(component.filteredPendingTodos()).toEqual([]);
  });

  it('should show error for invalid priority in form submission', () => {
    const mockForm = {
      form: {
        invalid: true,
        controls: {
          priority: { invalid: true },
          todoName: { invalid: false },
        },
        value: {
          todoName: 'Test Todo',
          priority: 0,
        },
        reset: jasmine.createSpy('reset'),
      },
    } as unknown as NgForm;

    component.onSubmit(mockForm);

    expect(component.errorMessage).toBe(
      'Please enter valid priorty value bigger than 0'
    );
  });

  it('should show error for invalid todo name in form submission', () => {
    const mockForm = {
      form: {
        invalid: true,
        controls: {
          priority: { invalid: false },
          todoName: { invalid: true },
        },
        value: {
          todoName: 'Test Todo',
          priority: 0,
        },
        reset: jasmine.createSpy('reset'),
      },
    } as unknown as NgForm;

    component.onSubmit(mockForm);

    expect(component.errorMessage).toBe(
      'Please enter valid todo name wih 1-500 characters'
    );
  });

  it('should show error for empty todo name after trim', () => {
    const mockForm = jasmine.createSpyObj('NgForm', ['reset'], {
      form: jasmine.createSpyObj('FormGroup', [], {
        value: {
          todoName: '   ',
          priority: 1,
        },
      }),
    });

    component.onSubmit(mockForm);

    expect(component.errorMessage).toBe(
      'Please enter valid todo name wih 1-500 characters'
    );
  });

  it('should call insertTodo on valid form submission', () => {
    mockTodosService.insertTodo.and.returnValue(
      of({
        name: 'Test Todo',
        priority: 1,
        status: Status.Pending,
      } as Todo)
    );

    const mockForm = jasmine.createSpyObj('NgForm', ['reset'], {
      form: jasmine.createSpyObj('FormGroup', ['reset'], {
        value: {
          todoName: 'Test Todo',
          priority: 1,
        },
      }),
    });

    component.todoName.set('Test Todo');
    component.priority.set(1);

    fixture.detectChanges();
    component.onSubmit(mockForm);

    expect(mockTodosService.insertTodo).toHaveBeenCalledWith({
      name: 'Test Todo',
      priority: 1,
      status: Status.Pending,
    });
  });

  it('should reset form after successful submission', () => {
    mockTodosService.insertTodo.and.returnValue(
      of({
        name: 'Test Todo',
        priority: 1,
        status: Status.Pending,
      } as Todo)
    );

    const mockForm = jasmine.createSpyObj('NgForm', ['reset'], {
      form: jasmine.createSpyObj('FormGroup', ['reset'], {
        value: {
          todoName: 'Test Todo',
          priority: 1,
        },
      }),
    });

    component.todoName.set('Test Todo');
    component.priority.set(1);

    component.onSubmit(mockForm);

    expect(mockForm.form.reset).toHaveBeenCalled();
  });

  it('should handle insertion error', () => {
    const errorMessage = 'Insert failed';
    mockTodosService.insertTodo.and.returnValue(
      throwError(() => new Error(errorMessage))
    );

    const mockForm = jasmine.createSpyObj('NgForm', ['reset'], {
      form: jasmine.createSpyObj('FormGroup', ['reset'], {
        value: {
          todoName: 'Test Todo',
          priority: 1,
        },
      }),
    });

    component.todoName.set('Test Todo');
    component.priority.set(1);

    component.onSubmit(mockForm);

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe(
      'Error adding new todo. Please try again later'
    );
  });

  it('should clear error message on successful submission', () => {
    mockTodosService.insertTodo.and.returnValue(
      of({
        name: 'Test Todo',
        priority: 1,
        status: Status.Pending,
      } as Todo)
    );

    const mockForm = jasmine.createSpyObj('NgForm', ['reset'], {
      form: jasmine.createSpyObj('FormGroup', ['reset'], {
        value: {
          todoName: 'Test Todo',
          priority: 1,
        },
      }),
    });

    component.todoName.set('Test Todo');
    component.priority.set(1);
    component.errorMessage = 'Previous error';

    component.onSubmit(mockForm);

    expect(component.errorMessage).toBe('');
  });

  it('should display pending todos in template', () => {
    fixture.detectChanges();
    const todoItems =
      fixture.nativeElement.querySelectorAll('app-pending-item');
    expect(todoItems.length).toBe(mockPendingTodos.length);
  });

  it('should show spinner when loading', () => {
    component.isLoading = true;
    fixture.detectChanges();

    const spinnerElement = fixture.nativeElement.querySelector('app-spinner');
    expect(spinnerElement).toBeTruthy();
  });
});
