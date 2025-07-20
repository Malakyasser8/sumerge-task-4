import { catchError, map, throwError, timeout } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginResponseData } from '../models/response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthSerivce {
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private tokenExpirationTimer: number | null = null;
  private currentUser: User | null = null;

  loginBaseUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCBmENHVczw_URDm00gMnohezionXsj9L0`;
  signUpBaseUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCBmENHVczw_URDm00gMnohezionXsj9L0`;
  timeoutTime: number = 10000;

  getCurrentUser() {
    if (
      this.currentUser?.accessToken &&
      this.currentUser?.expirationDate >= new Date()
    ) {
      return this.currentUser;
    }
    this.logout();
    return null;
  }

  autoLogin() {
    const userData = localStorage.getItem('userData');
    if (!userData) return;
    const loadedUser = JSON.parse(userData);
    this.currentUser = {
      ...loadedUser,
      expirationDate: new Date(loadedUser.expirationDate),
    };

    this.currentUser = this.getCurrentUser();
    if (this.currentUser) {
      const expirationDuration =
        new Date(this.currentUser.expirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  loginOrSignup(email: string, password: string, isLoginMode: boolean) {
    const url = isLoginMode ? this.loginBaseUrl : this.signUpBaseUrl;
    return this.httpClient
      .post<LoginResponseData>(url, {
        email,
        password,
        returnSecureToken: true,
      })
      .pipe(
        map((response: LoginResponseData) => {
          this.setCurrentUser(response);
          return this.currentUser;
        }),
        timeout(this.timeoutTime),
        catchError((error: HttpErrorResponse) => {
          const message = this.handleError(error);
          return throwError(() => new Error(message));
        })
      );
  }

  logout() {
    this.currentUser = null;
    this.router.navigate(['']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) clearTimeout(this.tokenExpirationTimer);
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    console.log(expirationDuration);
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'An unknown error occured. Please try again later';
    if (error?.error?.error?.message) {
      switch (error.error.error.message) {
        case 'INVALID_LOGIN_CREDENTIALS':
          message = 'The email or password is incorrect. Please try again.';
          break;
        case 'USER_DISABLED':
          message = 'This account has been disabled. Please contact support.';
          break;
        case 'TOO_MANY_ATTEMPTS_TRY_LATER':
          message = 'Too many failed attempts. Please try again later.';
          break;
        case 'EMAIL_EXISTS':
          message =
            'This email is already used. Please choose another email and try again.';
          break;
      }
    }

    return message;
  }

  private setCurrentUser(response: LoginResponseData) {
    const expirationDate: Date = new Date(
      new Date().getTime() + parseInt(response.expiresIn) * 1000
    );
    this.currentUser = {
      id: response.localId,
      email: response.email,
      displayName: response.displayName,
      accessToken: response.idToken,
      refreshToken: response.refreshToken,
      expirationDate,
    };
    localStorage.setItem('userData', JSON.stringify(this.currentUser));
    this.autoLogout(parseInt(response.expiresIn) * 1000);
  }
}
