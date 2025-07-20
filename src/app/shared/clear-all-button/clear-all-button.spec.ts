import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearAllButton } from './clear-all-button';
import { TodosService } from '../../services/todos.service';
import { of, throwError } from 'rxjs';

describe('ClearAllButton', () => {
  let component: ClearAllButton;
  let fixture: ComponentFixture<ClearAllButton>;
  let mockTodosService: jasmine.SpyObj<TodosService>;

  beforeEach(async () => {
    mockTodosService = jasmine.createSpyObj('TodosService', ['deleteAllTodos']);

    await TestBed.configureTestingModule({
      imports: [ClearAllButton],
      providers: [{ provide: TodosService, useValue: mockTodosService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ClearAllButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call deleteAllTodos and set isLoading to false on complete', () => {
    mockTodosService.deleteAllTodos.and.returnValue(of());

    component.deleteAllData();

    fixture.detectChanges();

    expect(mockTodosService.deleteAllTodos).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('');
  });

  it('should set errorMessage if deleteAllTodos fails', () => {
    mockTodosService.deleteAllTodos.and.returnValue(
      throwError(() => new Error('Delete failed'))
    );

    component.deleteAllData();

    expect(mockTodosService.deleteAllTodos).toHaveBeenCalled();
    expect(component.errorMessage).toContain('Error while deleting all Todos');
  });
});
