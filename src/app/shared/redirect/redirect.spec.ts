import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Redirect } from './redirect';
import { AuthSerivce } from '../../services/auth.service';
import { Router } from '@angular/router';

describe('Redirect', () => {
  let component: Redirect;
  let fixture: ComponentFixture<Redirect>;
  let mockAuthService: jasmine.SpyObj<AuthSerivce>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthSerivce', ['getCurrentUser']);
    mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);
    await TestBed.configureTestingModule({
      imports: [Redirect],
      providers: [
        { provide: AuthSerivce, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Redirect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
