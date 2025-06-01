import {Component, OnInit} from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {AuthService} from '@core/services/auth.service';
import {QuestionService} from '@core/services/question.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {QuestionsPaginationComponent} from '../../shared/questions-pagination/questions-pagination.component';
import {TruncatePipe} from '@core/truncate.pipe';
import {Question} from '@core/models/question.model';
import {ConfirmationDialogComponent} from '../../shared/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {MessageComponent} from '../../shared/message/message.component';

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [NavbarComponent, NgForOf, RouterLink, DatePipe, QuestionsPaginationComponent, TruncatePipe, NgIf, MessageComponent],
  templateUrl: './foro.component.html',
  styleUrl: './foro.component.css',
})
export class foroComponent implements OnInit {

  questions: Question[] = [];
  currentPage: number = 0;
  totalPages: number = 0;

  sortField = 'creationDate';
  sortDirection = 'desc';
  unansweredOnly = false;
  viewsSortDirection: 'desc' | 'asc' | null = null;

  errorMessage: string | null = null;

  constructor(private router: Router, private route: ActivatedRoute, protected dialog: MatDialog,
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
    if (this.sortField === 'views') {
      this.sortField = 'creationDate';
      this.sortDirection = 'desc';
      this.viewsSortDirection = null;
    }
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
    this.unansweredOnly = false;
    this.loadQuestions(0);
  }

  onDeleteQuestion(questionId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Question',
        message: 'Are you sure you want to delete this question?'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.questionService.deleteQuestion(questionId).subscribe({
          next: () => {
            this.questions = this.questions.filter(q => q.id !== questionId);
            this.router.navigate(['/questions']).then();
          },
          error: err => {
            this.errorMessage = 'An error occurred while deleting the question';
          }
        });
      }
    });
  }
}
