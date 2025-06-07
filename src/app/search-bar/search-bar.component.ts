import {Component, ElementRef, EventEmitter, HostListener, OnInit, Output} from '@angular/core';
import {debounceTime, distinctUntilChanged, of, Subject, switchMap} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {QuestionService} from '@core/services/question.service';
import {TruncatePipe} from '@core/truncate.pipe';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-search-bar',
  imports: [
    FormsModule,
    TruncatePipe,
    NgForOf,
    NgIf
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent implements OnInit {
  searchQuery = '';
  searchTerms = new Subject<string>();
  searchResults: any[] = [];
  showSearchResults = false;
  searchPage = 0;
  loadingMore = false;
  hasMoreResults = true;

  @Output() searchExecuted = new EventEmitter<string>();

  constructor(private readonly questionService: QuestionService, private readonly router: Router, private elementRef: ElementRef) { }

  ngOnInit() {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length > 0) {
          return this.questionService.searchQuestionsAndAnswers(term, 0, 10);
        } else {
          this.showSearchResults = false;
          return of({ content: [] });
        }
      })
    ).subscribe({
      next: response => {
        this.searchResults = response?.content || [];
        this.showSearchResults = this.searchQuery.trim().length > 0;
        this.hasMoreResults = (response?.page?.number + 1) < response?.page?.totalPages;
      },
      error: err => {
        console.error('Live search error:', err);
        this.searchResults = [];
        this.showSearchResults = false;
      }
    });
  }

  onSearchInput(): void {
    console.log('Input changed:', this.searchQuery);
    this.searchTerms.next(this.searchQuery);
  }

  executeSearch(): void {
    if (this.searchQuery.trim()) {
      this.searchTerms.next(this.searchQuery.trim());
      this.searchPage = 0;
      this.hasMoreResults = true;

      this.searchExecuted.emit(this.searchQuery.trim());
    }
  }

  loadMoreResults(): void {
    this.loadingMore = true;
    this.searchPage++;

    this.questionService.searchQuestionsAndAnswers(this.searchQuery, this.searchPage, 10)
      .subscribe({
        next: response => {
          const newResults = response?.content || [];
          this.searchResults = [...this.searchResults, ...newResults];
          const currentPage = response?.page?.number;
          const totalPages = response?.page?.totalPages;
          this.hasMoreResults = (currentPage + 1) < totalPages;
          this.loadingMore = false;
        },
        error: err => {
          console.error(err);
          this.loadingMore = false;
        }
      });
  }

  navigateToQuestion(questionId: number): void {
    this.router.navigate(['/question', questionId]).then();
    this.showSearchResults = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSearchResults = false;
    }
  }
}
