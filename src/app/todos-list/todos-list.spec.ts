import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { TodosList } from './todos-list';
import { AuthSerivce } from '../services/auth.service';

describe('TodosList', () => {
  let component: TodosList;
  let fixture: ComponentFixture<TodosList>;
  let mockAuthService: jasmine.SpyObj<AuthSerivce>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthSerivce', [
      'logout',
      'getCurrentUser',
    ]);

    await TestBed.configureTestingModule({
      imports: [TodosList],
      providers: [
        { provide: AuthSerivce, useValue: mockAuthService },
        provideHttpClient(withFetch()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TodosList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
