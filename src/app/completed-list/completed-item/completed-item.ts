import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-completed-item',
  imports: [],
  templateUrl: './completed-item.html',
  styleUrl: './completed-item.css',
})
export class CompletedItem {
  @Input({ required: true }) completeItemTitle!: string;
}
