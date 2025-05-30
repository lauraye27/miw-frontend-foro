import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {NavbarComponent} from "../../navbar/navbar.component";
import {Router, RouterLink} from '@angular/router';
import {QuestionService} from '@core/services/question.service';
import {AuthService} from '@core/services/auth.service';
import {MessageComponent} from '../../shared/message/message.component';
import {ConfirmationDialogComponent} from '../../shared/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {QuestionsPaginationComponent} from '../../shared/questions-pagination/questions-pagination.component';

@Component({
  selector: 'app-my-questions',
  imports: [DatePipe, NavbarComponent, NgForOf, RouterLink, NgIf, MessageComponent, QuestionsPaginationComponent],
  templateUrl: './my-questions.component.html',
  styleUrl: './my-questions.component.css'
})
export class MyQuestionsComponent implements OnInit {
  questions: any[] = [];
  currentPage: number = 0;
  totalPages: number = 0;

  errorMessage: string | null = null;

  @ViewChild('deleteConfirmationTemplate') deleteConfirmationTemplate!: TemplateRef<any>;

  constructor(private router: Router, private questionService: QuestionService, private authService: AuthService,
              protected dialog: MatDialog) {}

  ngOnInit() {
    this.loadMyQuestions(0);
  }

  loadMyQuestions(page: number): void {
    const email = this.authService.getUser()?.email;
    if (email) {
      this.questionService.getMyQuestions(page)
        .subscribe(response => {
          this.questions = response.content;
          this.currentPage = response.page.number;
          this.totalPages = response.totalPages;
        });
    }
  }

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages && newPage !== this.currentPage) {
      this.loadMyQuestions(newPage);
    }
  }

  onAskClick(): void {
    console.log('onAskClick');
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/question-form']).then();
    }
  }

  onEditQuestion(questionId: number, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/question-form', questionId]).then();
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
            this.router.navigate(['/my-questions']).then();
          },
          error: err => {
            this.errorMessage = 'An error occurred while deleting the question';
          }
        });
      }
    });
  }

}
