import { catchError, map, throwError, timeout } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthSerivce {
  private httpClient = inject(HttpClient);
  loginBaseUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCBmENHVczw_URDm00gMnohezionXsj9L0`;
  signUpBaseUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCBmENHVczw_URDm00gMnohezionXsj9L0`;
  timeoutTime: number = 10000;
  currentUser: User | undefined = undefined;

  getCurrentUser() {
    return this.currentUser;
  }

  login(email: string, password: string, isLoginMode: boolean) {
    const url = isLoginMode ? this.loginBaseUrl : this.signUpBaseUrl;
    return this.httpClient
      .post<LoginResponseData>(url, {
        email,
        password,
        returnSecureToken: true,
      })
      .pipe(
        map((response) => {
          this.currentUser = {
            id: response.localId,
            email: response.email,
            displayName: response.displayName,
            accessToken: response.idToken,
            refreshToken: response.refreshToken,
          };
          return this.currentUser;
        }),
        timeout(this.timeoutTime),
        catchError((error: any) => {
          let message = 'An unknown error occured. Please try again later';
          if (error?.error?.error?.message) {
            switch (error.error.error.message) {
              case 'INVALID_LOGIN_CREDENTIALS':
                message =
                  'The email or password is incorrect. Please try again.';
                break;
              case 'USER_DISABLED':
                message =
                  'This account has been disabled. Please contact support.';
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
          return throwError(() => new Error(message));
        })
      );
  }
}
