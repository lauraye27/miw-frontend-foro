import {Component, EventEmitter, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {QuestionService} from '@core/services/question.service';
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
  // suggestions: any[] = [];
  // showSuggestions = false;
  private searchTerms = new Subject<string>();

  @Output() liveResults = new EventEmitter<any[]>();
  @Output() searchExecuted = new EventEmitter<string>();
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private questionService: QuestionService) {
    // this.searchTerms.pipe(
    //   debounceTime(300),
    //   distinctUntilChanged(),
    //   // switchMap(query =>
    //   //   query.length > 2
    //   //     ? this.questionService.searchSuggestions(query)
    //   //     : of([])
    //   // )
    // ).subscribe(results => {
    //   // this.suggestions = results;
    //   // this.showSuggestions = results.length > 0;
    //   this.liveResults.emit(results);
    // });
  }

  onSearchInput(): void {
    if (this.searchQuery.length > 2) {
      this.searchTerms.next(this.searchQuery);
    } else {
      // this.suggestions = [];
      // this.showSuggestions = false;
    }
  }

  executeSearch(): void {
    // this.showSuggestions = false;
    if (this.searchQuery.trim()) {
      this.searchExecuted.emit(this.searchQuery);
    }
  }

  // selectSuggestion(item: any): void {
  //   this.searchQuery = item.title;
  //   this.showSuggestions = false;
  //   this.searchExecuted.emit(item.title);
  // }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchExecuted.emit('');
  }

  // hideSuggestions(): void {
  //   setTimeout(() => {
  //     this.showSuggestions = false;
  //     this.clickOutside.emit();
  //   }, 200);
  // }

  // @HostListener('document:click', ['$event'])
  // onClickOutside(event: Event) {
  //   if (!this.isInside(event.target as HTMLElement)) {
  //     this.showSuggestions = false;
  //   }
  // }

  // private isInside(target: HTMLElement): boolean {
  //   return !!target.closest('.search-container');
  // }
}



/*export class SearchBarComponent {
  searchQuery = '';
  suggestions: any[] = [];
  showSuggestions = false;
  private searchTerms = new Subject<string>();

  @Output() searchExecuted = new EventEmitter<string>();

  constructor(private questionService: QuestionService) {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => query.length > 2
        ? this.questionService.searchSuggestions(query)
        : of([]))
    ).subscribe(results => {
      this.suggestions = results;
      this.showSuggestions = results.length > 0;
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.isInside(event.target as HTMLElement)) {
      this.showSuggestions = false;
    }
  }

  private isInside(target: HTMLElement): boolean {
    return !!target.closest('.search-container');
  }

  onSearchInput(): void {
    this.searchTerms.next(this.searchQuery);
  }

  executeSearch(): void {
    this.showSuggestions = false;
    if (this.searchQuery.trim()) {
      this.searchExecuted.emit(this.searchQuery);
    }
  }

  selectSuggestion(item: any): void {
    this.searchQuery = item.title;
    this.showSuggestions = false;
    this.searchExecuted.emit(item.title);
  }
}*/
