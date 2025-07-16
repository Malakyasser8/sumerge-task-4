import { Component, inject, signal, DestroyRef } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthSerivce } from '../services/auth.service';
import { Router } from '@angular/router';
import { Spinner } from '../shared/spinner/spinner';
import { ErrorComponent } from '../shared/error-component/error-component';

@Component({
  selector: 'app-login-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    Spinner,
    ErrorComponent,
  ],
  templateUrl: './login-form.html',
  styleUrls: ['./login-form.css', '../shared/shared-list-container.css'],
})
export class LoginForm {
  authService = inject(AuthSerivce);
  private router = inject(Router);
  destroyRef = inject(DestroyRef);
  errorMessage = signal<string>('');
  isLoading: boolean = false;
  isLoginMode: boolean = true;

  loginForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  get isInvalidEmail() {
    return (
      this.loginForm.controls.email.touched &&
      this.loginForm.controls.email.invalid
    );
  }

  get isInvalidPassword() {
    return (
      this.loginForm.controls.password.touched &&
      this.loginForm.controls.password.invalid
    );
  }

  constructor() {
    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage.set('');
    });
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage.set('');
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const enteredEmail = this.loginForm.value.email?.toString();
    const enteredPassword = this.loginForm.value.password?.toString();
    this.isLoading = true;

    if (enteredEmail && enteredPassword) {
      const subscription = this.authService
        .login(enteredEmail, enteredPassword, this.isLoginMode)
        .subscribe({
          next: (val) => {
            console.log(`Logged in successfully. Loggin user details`);
            console.log(val);
          },
          complete: () => {
            console.log(`Logged in successfully`);
            this.isLoading = false;
            this.router.navigate(
              ['/todos', 'user', this.authService.getCurrentUser()?.id],
              {
                replaceUrl: true, //go back to login form aady
              }
            );
          },
          error: (error) => {
            this.isLoading = false;
            console.log(`Error occured`);
            console.log(error);
            this.errorMessage.set(error);
          },
        });

      this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }
  }
}
