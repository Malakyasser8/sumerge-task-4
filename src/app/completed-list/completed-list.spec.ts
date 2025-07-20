import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { CompletedList } from './completed-list';
import { TodosService } from '../services/todos.service';
import { Status, Todo } from '../models/todos.model';

describe('CompletedList', () => {
  let component: CompletedList;
  let fixture: ComponentFixture<CompletedList>;
  let mockHttpClient: jasmine.SpyObj<HttpClient>;
  let mockTodosService: any;

  const mockTodos: Todo[] = [
    {
      id: '1',
      userId: '1',
      name: 'Task One',
      priority: 1,
      status: Status.Completed,
    },
    {
      id: '2',
      userId: '1',
      name: 'Another Task',
      priority: 2,
      status: Status.Completed,
    },
  ];

  beforeEach(async () => {
    mockTodosService = jasmine.createSpyObj('TodosService', [
      'loadTodos',
      'updateTodo',
    ]);
    mockTodosService.loadTodos.and.returnValue(of(signal(mockTodos)));
    mockTodosService.loadedCompletedTodos = signal(mockTodos);
    mockHttpClient = jasmine.createSpyObj('HttpClient', ['post']);

    await TestBed.configureTestingModule({
      imports: [CompletedList],
      providers: [
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: TodosService, useValue: mockTodosService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompletedList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load completed todos on init (success)', () => {
    mockTodosService.loadTodos.and.returnValue(of([]));

    component.ngOnInit();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('');
    expect(mockTodosService.loadTodos).toHaveBeenCalledWith(Status.Completed);
  });

  it('should handle error when loading todos', () => {
    const errorMsg = 'Something went wrong';
    mockTodosService.loadTodos.and.returnValue(
      throwError(() => new Error(errorMsg))
    );

    component.ngOnInit();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toContain('Error retriving completed todos');
  });

  it('should filter todos based on searchText', () => {
    (component.searchText as any).set('one');
    const result = component.filteredCompletedTodos();

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Task One');
  });

  it('should handle drop and call updateTodo', () => {
    const droppedTodo: Todo = {
      id: '1',
      userId: '1',
      name: 'Task One',
      priority: 1,
      status: Status.Pending,
    };

    mockTodosService.updateTodo.and.returnValue(of(undefined));

    const event = {
      preventDefault: () => {},
      dataTransfer: {
        getData: () => JSON.stringify(droppedTodo),
      },
    } as unknown as DragEvent;

    spyOn(event, 'preventDefault');

    component.drop(event);

    expect(component.isLoading).toBeFalse();
    expect(mockTodosService.updateTodo).toHaveBeenCalledWith({
      ...droppedTodo,
      status: Status.Completed,
    });
    expect(component.errorMessage).toBe('');
  });

  it('should not handle drop when there is no data', () => {
    const event = {
      preventDefault: () => {},
      dataTransfer: {
        getData: () => null,
      },
    } as unknown as DragEvent;

    spyOn(event, 'preventDefault');

    component.drop(event);

    expect(mockTodosService.updateTodo).not.toHaveBeenCalled();
  });

  it('should handle drop error from updateTodo', () => {
    const droppedTodo = {
      id: '2',
      name: 'Bad Task',
      priority: 5,
      status: Status.Pending,
    };

    mockTodosService.updateTodo.and.returnValue(
      throwError(() => new Error('update failed'))
    );

    const event = {
      preventDefault: () => {},
      dataTransfer: {
        getData: () => JSON.stringify(droppedTodo),
      },
    } as unknown as DragEvent;

    component.drop(event);

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toContain('Error while marking todo');
  });
});
