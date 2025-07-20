import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginForm } from './login-form';
import { AuthSerivce } from '../services/auth.service';

describe('LoginForm', () => {
  let component: LoginForm;
  let fixture: ComponentFixture<LoginForm>;
  let mockHttpClient: jasmine.SpyObj<HttpClient>;
  let mockAuthService: jasmine.SpyObj<AuthSerivce>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthSerivce', ['loginOrSignup']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockHttpClient = jasmine.createSpyObj('HttpClient', ['post']);

    await TestBed.configureTestingModule({
      imports: [LoginForm],
      providers: [
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: AuthSerivce, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginForm);
    component = fixture.componentInstance;
    component.isLoginMode = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title if login mode', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Login');
  });

  it('should render title if signup mode', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    component.isLoginMode = false;
    fixture.detectChanges();

    expect(compiled.querySelector('h1')?.textContent).toContain('SignUp');
  });

  it('should render submit button content if login mode', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('#submit-button')?.textContent).toContain(
      'Login'
    );
  });

  it('should render submit button content if sign up mode', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    component.isLoginMode = false;
    fixture.detectChanges();

    expect(compiled.querySelector('#submit-button')?.textContent).toContain(
      'SignUp'
    );
  });

  it('should render switch button content if login mode', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('#switch-mode-button')?.textContent
    ).toContain('Switch to SignUp mode');
  });

  it('should render switch button content if sign up mode', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    component.isLoginMode = false;
    fixture.detectChanges();

    expect(
      compiled.querySelector('#switch-mode-button')?.textContent
    ).toContain('Switch to Login mode');
  });

  it('should toggle switch button content on click', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const button = compiled.querySelector('#switch-mode-button') as HTMLElement;
    button.click();
    fixture.detectChanges();

    expect(button?.textContent).toContain('Switch to Login mode');
  });

  it('should create a loginForm FormGroup comprised of FormControls', () => {
    expect(component.loginForm instanceof FormGroup).toBe(true);
  });

  it('should check for valid email', () => {
    component.loginForm.controls.email.setValue('test@gmail.com');
    fixture.detectChanges();

    expect(component.loginForm.controls.email.valid).toBe(true);
  });

  it('should check for valid email with isInvalidEmail getter', () => {
    component.loginForm.controls.email.setValue('test@gmail.com');
    component.loginForm.controls.email.markAsTouched();

    fixture.detectChanges();

    expect(component.isInvalidEmail).toBe(false);
  });

  it('should check for invalid email', () => {
    component.loginForm.controls.email.setValue('test');
    fixture.detectChanges();

    expect(component.loginForm.controls.email.valid).toBe(false);
  });

  it('should check for invalid email with isInvalidEmail getter', () => {
    component.loginForm.controls.email.setValue('test');
    component.loginForm.controls.email.markAsTouched();

    fixture.detectChanges();

    expect(component.isInvalidEmail).toBe(true);
  });

  it('should check for valid password', () => {
    component.loginForm.controls.password.setValue('pass123456');
    fixture.detectChanges();

    expect(component.loginForm.controls.password.valid).toBe(true);
  });

  it('should check for valid password with isInvalidPassword getter', () => {
    component.loginForm.controls.password.setValue('pass123456');
    component.loginForm.controls.password.markAsTouched();

    fixture.detectChanges();

    expect(component.isInvalidPassword).toBe(false);
  });

  it('should check for invalid password', () => {
    component.loginForm.controls.password.setValue('test');
    fixture.detectChanges();

    expect(component.loginForm.controls.password.valid).toBe(false);
  });

  it('should check for invalid password with isInvalidPassword getter', () => {
    component.loginForm.controls.password.setValue('test');
    component.loginForm.controls.password.markAsTouched();

    fixture.detectChanges();

    expect(component.isInvalidPassword).toBe(true);
  });

  it('should not call loginOrSignup if form is invalid', () => {
    component.loginForm.setValue({ email: '', password: '' });
    component.onSubmit();
    expect(mockAuthService.loginOrSignup).not.toHaveBeenCalled();
  });

  it('should call loginOrSignup and navigate on successful submit', () => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: '123456',
    });

    fixture.detectChanges();
    expect(component.loginForm.valid).toBeTrue();

    const mockResponse: User = {
      id: '1',
      email: 'test@example.com',
      displayName: 'test',
      accessToken: 'abc123',
      refreshToken: '123',
      expirationDate: new Date(),
    };
    mockAuthService.loginOrSignup.and.returnValue(of(mockResponse));

    component.onSubmit();

    expect(mockAuthService.loginOrSignup).toHaveBeenCalledWith(
      'test@example.com',
      '123456',
      true
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/todos'], {
      replaceUrl: false,
    });
    expect(component.isLoading).toBeFalse();
  });

  it('should handle error on failed login', () => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: '123456',
    });

    const mockErrorMessage = 'Login failed';

    mockAuthService.loginOrSignup.and.returnValue(
      throwError(() => mockErrorMessage)
    );

    component.onSubmit();

    expect(component.errorMessage).toBe(mockErrorMessage);
    expect(component.isLoading).toBeFalse();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
