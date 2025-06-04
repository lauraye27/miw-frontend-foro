import {Component, OnInit} from '@angular/core';
import {AnswerService} from '@core/services/answer.service';
import {Router} from '@angular/router';
import {AuthService} from '@core/services/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationDialogComponent} from '../../shared/confirmation-dialog/confirmation-dialog.component';
import {MessageComponent} from '../../shared/message/message.component';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {PaginationComponent} from '../../shared/pagination/pagination.component';
import {Answer} from '@core/models/answer.model';

@Component({
  selector: 'app-my-answers',
  imports: [
    MessageComponent,
    DatePipe,
    NgForOf,
    NgIf,
    PaginationComponent
  ],
  templateUrl: './my-answers.component.html',
  styleUrl: './my-answers.component.css'
})
export class MyAnswersComponent implements OnInit {
  answers: Answer[] = [];
  currentPage: number = 0;
  totalPages: number = 0;

  errorMessage: string | null = null;

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
          this.totalPages = response.page.totalPages;
        });
    }
  }

  navigateToAnswer(questionId: number, answerId?: number) {
    if (answerId) {
      this.router.navigate(['/question', questionId], {
        queryParams: { answer: answerId }
      });
    } else {
      this.router.navigate(['/question', questionId]);
    }
  }

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages && newPage !== this.currentPage) {
      this.loadMyAnswers(newPage);
    }
  }

  onEditAnswer(answerId: number, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/answer-form', answerId]).then();
  }

  onDeleteAnswer(answer: Answer, event: MouseEvent): void {
    event.stopPropagation();

    this.router.navigate(['/question', answer.questionId], {
      queryParams: { answer: answer.id }
    }).then(() => {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'Delete Answer',
          message: 'Are you sure you want to delete this answer?'
        }
      });

      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.answerService.deleteAnswer(answer.id).subscribe({
            next: () => {
              this.answers = this.answers.filter(a => a.id !== answer.id);
              this.router.navigate(['/my-answers']).then();
            },
            error: err => {
              this.errorMessage = 'An error occurred while deleting the answer';
            }
          });
        }
      });
    });
  }
}
