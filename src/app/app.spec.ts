import { TestBed } from '@angular/core/testing';

import { App } from './app';
import { AuthSerivce } from './services/auth.service';

describe('App', () => {
  let mockAuthService: jasmine.SpyObj<AuthSerivce>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthSerivce', ['autoLogin']);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: AuthSerivce, useValue: mockAuthService }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have the title as `todo-list-angular` ', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('todo-list-angular');
  });
});
