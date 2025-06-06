import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-message',
  imports: [
    NgIf
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent implements OnChanges {
  @Input() successMessage: string | null = null;
  @Input() errorMessage: string | null = null;
  showMessage = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['successMessage'] || changes['errorMessage']) {
      this.showMessage = true;

      setTimeout(() => {
        this.showMessage = false;
      }, 5000);
    }
  }
}
