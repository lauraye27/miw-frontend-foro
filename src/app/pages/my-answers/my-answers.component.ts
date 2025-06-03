import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {AnswerService} from '@core/services/answer.service';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '@core/services/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationDialogComponent} from '../../shared/confirmation-dialog/confirmation-dialog.component';
import {MessageComponent} from '../../shared/message/message.component';
import {NavbarComponent} from '../../navbar/navbar.component';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {QuestionsPaginationComponent} from '../../shared/questions-pagination/questions-pagination.component';

@Component({
  selector: 'app-my-answers',
  imports: [
    MessageComponent,
    NavbarComponent,
    DatePipe,
    NgForOf,
    NgIf,
    QuestionsPaginationComponent,
    RouterLink
  ],
  templateUrl: './my-answers.component.html',
  styleUrl: './my-answers.component.css'
})
export class MyAnswersComponent implements OnInit {
  answers: any[] = [];
  currentPage: number = 0;
  totalPages: number = 0;

  errorMessage: string | null = null;

  @ViewChild('deleteConfirmationTemplate') deleteConfirmationTemplate!: TemplateRef<any>;

  constructor(private router: Router, private answerService: AnswerService, private authService: AuthService,
              protected dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadMyAnswers(0);
  }

  loadMyAnswers(page: number): void {
    const email = this.authService.getUser()?.email;
    if (email) {
      this.answerService.getMyAnswers(page)
        .subscribe(response => {
          this.answers = response.content;
          this.currentPage = response.page.number;
          this.totalPages = response.totalPages;
        });
    }
  }

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages && newPage !== this.currentPage) {
      this.loadMyAnswers(newPage);
    }
  }

  onAskClick(): void {
    console.log('onAskClick');
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/answer-form']).then();
    }
  }

  onEditAnswer(answerId: number, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/answer-form', answerId]).then();
  }

  onDeleteAnswer(answerId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Answer',
        message: 'Are you sure you want to delete this answer?'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.answerService.deleteAnswer(answerId).subscribe({
          next: () => {
            this.answers = this.answers.filter(q => q.id !== answerId);
            this.router.navigate(['/my-answers']).then();
          },
          error: err => {
            this.errorMessage = 'An error occurred while deleting the answer';
          }
        });
      }
    });
  }
}
