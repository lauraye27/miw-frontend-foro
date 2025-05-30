import {Component, OnInit} from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {AuthService} from '@core/services/auth.service';
import {QuestionService} from '@core/services/question.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [NavbarComponent, NgForOf, RouterLink, DatePipe, NgIf],
  templateUrl: './foro.component.html',
  styleUrl: './foro.component.css',
})
export class foroComponent implements OnInit {

  questions: any[] = [];
  currentPage: number;
  totalPages: number;
  visiblePages: number[] = [0];

  sortField = 'creationDate';
  sortDirection = 'desc';
  unansweredOnly = false;
  viewsSortDirection: 'desc' | 'asc' | null = null;

  constructor(private router: Router, private route: ActivatedRoute,
              protected authService: AuthService, private questionService: QuestionService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const tag = params['tag'] || null;
      this.loadQuestions(0, tag);
    });
  }

  loadQuestions(page: number = 0, tag?: string): void {
    this.questionService.getQuestions(page, this.sortField, this.sortDirection, this.unansweredOnly, tag).subscribe({
      next: (res) => {
        this.questions = res.content;
        this.currentPage = res.page.number;
        this.totalPages = res.page.totalPages;
        this.updateVisiblePages();
      },
      error: (err) => console.error('Error loading questions', err)
    });
  }

  onAskClick(): void {
    console.log('onAskClick');
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/question-form']).then();
    }
  }

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages && newPage !== this.currentPage) {
      this.loadQuestions(newPage);
    }
  }

  updateVisiblePages(): void {
    const maxVisible = 5;
    this.visiblePages = [];

    if (this.totalPages <= maxVisible) {
      for (let i = 0; i < this.totalPages; i++) {
        this.visiblePages.push(i);
      }
    } else {
      let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages - 1, start + maxVisible - 1);

      if (end === this.totalPages - 1) {
        start = Math.max(0, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        this.visiblePages.push(i);
      }
    }
  }

  toggleSortByDate(): void {
    if (this.sortField === 'creationDate') {
      this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
    } else {
      this.sortField = 'creationDate';
      this.sortDirection = 'desc';
    }
    this.viewsSortDirection = null;
    this.loadQuestions(0);
  }

  toggleUnansweredOnly(): void {
    this.unansweredOnly = !this.unansweredOnly;
    this.loadQuestions(0);
  }

  toggleSortByViews(): void {
    if (this.sortField === 'views') {
      this.viewsSortDirection = this.viewsSortDirection === 'desc' ? 'asc' : 'desc';
      this.sortDirection = this.viewsSortDirection;
    } else {
      this.sortField = 'views';
      this.viewsSortDirection = 'desc';
      this.sortDirection = 'desc';
    }
    this.loadQuestions(0);
  }
}
