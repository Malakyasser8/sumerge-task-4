import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { PendingItem } from './pending-item';
import { Status, Todo } from '../../models/todos.model';

describe('PendingItem', () => {
  let component: PendingItem;
  let fixture: ComponentFixture<PendingItem>;
  let mockHttpClient: jasmine.SpyObj<HttpClient>;

  const mockTodo: Todo = {
    id: '1',
    userId: '123',
    name: 'Test Todo',
    priority: 1,
    status: Status.Pending,
  };

  beforeEach(async () => {
    mockHttpClient = jasmine.createSpyObj('HttpClient', ['post']);

    await TestBed.configureTestingModule({
      imports: [PendingItem],
      providers: [{ provide: HttpClient, useValue: mockHttpClient }],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingItem);
    component = fixture.componentInstance;
    component.pendingTodo = mockTodo;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display pending item title correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    component.pendingTodo.priority = 1;
    component.pendingTodo.name = 'Test';
    fixture.detectChanges();

    expect(compiled.querySelector('label')?.textContent).toContain('1. Test');
  });
});
