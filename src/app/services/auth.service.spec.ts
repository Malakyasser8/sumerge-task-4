import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { AuthSerivce } from './auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('Auth', () => {
  let service: AuthSerivce;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockHttpClient: jasmine.SpyObj<HttpClient>;

  const validUser: User = {
    id: '1',
    email: 'test@gmail.com',
    displayName: 'tester',
    accessToken: '123',
    refreshToken: '123',
    expirationDate: new Date(Date.now() + 30 * 60 * 1000),
  };

  const expiredUser = {
    ...validUser,
    expirationDate: new Date(Date.now() - 30 * 60 * 1000),
  };

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockHttpClient = jasmine.createSpyObj('HttpClient', ['post']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: HttpClient, useValue: mockHttpClient },
      ],
    });
    service = TestBed.inject(AuthSerivce);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null and logout if user is expired', () => {
    service['currentUser'] = expiredUser;

    const user = service.getCurrentUser();
    expect(user).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['']);
  });

  it('should return the user if token is still valid', () => {
    service['currentUser'] = validUser;

    const user = service.getCurrentUser();
    expect(user).toEqual(validUser);
  });

  it('should restore user from localStorage if valid', () => {
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(validUser));
    spyOn(localStorage, 'removeItem');
    const autoLogoutSpy = spyOn<any>(service, 'autoLogout');

    service.autoLogin();
    expect(service['currentUser']).toEqual(validUser);
    expect(autoLogoutSpy).toHaveBeenCalled();
  });

  it('should logout if stored user is expired', () => {
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(expiredUser));
    spyOn(localStorage, 'removeItem');

    service.autoLogin();
    expect(service['currentUser']).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['']);
  });

  it('should clear user and navigate', () => {
    localStorage.setItem('userData', JSON.stringify(validUser));
    service['currentUser'] = validUser;

    service.logout();

    expect(service['currentUser']).toBeNull();
    expect(localStorage.getItem('userData')).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['']);
  });

  it('should set current user on successful login', (done) => {
    const response = {
      email: validUser.email,
      localId: validUser.id,
      displayName: validUser.displayName,
      idToken: validUser.accessToken,
      refreshToken: validUser.refreshToken,
      expiresIn: '3600',
    };
    mockHttpClient.post.and.returnValue(of(response));

    service
      .loginOrSignup(validUser.email, 'password', true)
      .subscribe((user) => {
        expect(service['currentUser']).toBeTruthy();
        expect(user?.email).toBe(validUser.email);
        done();
      });
  });

  it('should throw error on failed login', (done) => {
    const errorResponse = {
      error: {
        error: {
          message: 'INVALID_LOGIN_CREDENTIALS',
        },
      },
    };
    mockHttpClient.post.and.returnValue(throwError(() => errorResponse));

    service.loginOrSignup('wrong@test.com', 'wrong', true).subscribe({
      error: (err: Error) => {
        expect(err.message).toContain('email or password is incorrect');
        done();
      },
    });
  });
});
