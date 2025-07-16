import { Routes } from '@angular/router';
import { LoginForm } from './login-form/login-form';
import { authorizedToLogin } from './guards/auth.guard';
import { Redirect } from './shared/redirect/redirect';

export const routes: Routes = [
  { path: '', component: LoginForm },
  {
    path: 'todos',
    loadComponent: () =>
      import('./todos-list/todos-list').then((module) => module.TodosList),
    canActivate: [authorizedToLogin],
  },
  { path: '**', component: Redirect },
];
