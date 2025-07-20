import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthSerivce } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  title = 'todo-list-angular';
  authService = inject(AuthSerivce);

  ngOnInit(): void {
    this.authService.autoLogin();
  }
}
