import { Component, Input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-spinner',
  imports: [MatProgressSpinner],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
})
export class Spinner {
  @Input({ required: true }) isLoading!: boolean;
}
