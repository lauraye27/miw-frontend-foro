import {Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-message',
  imports: [
    NgIf
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
  @Input() successMessage: string | null = null;
  @Input() errorMessage: string | null = null;

  clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }
}
