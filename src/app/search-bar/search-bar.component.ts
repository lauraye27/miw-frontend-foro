import {Component, EventEmitter, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [
    FormsModule
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {
  searchQuery = '';
  private searchTerms = new Subject<string>();

  @Output() liveResults = new EventEmitter<any[]>();
  @Output() searchExecuted = new EventEmitter<string>();
  @Output() clickOutside = new EventEmitter<void>();

  onSearchInput(): void {
    if (this.searchQuery.length > 2) {
      this.searchTerms.next(this.searchQuery);
    }
  }

  executeSearch(): void {
    if (this.searchQuery.trim()) {
      this.searchExecuted.emit(this.searchQuery);
    }
  }
}
