import {Component, OnInit} from '@angular/core';
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {NavbarComponent} from "../../navbar/navbar.component";
import {Router, RouterLink} from '@angular/router';
import {QuestionService} from '@core/services/question.service';
import {AuthService} from '@core/services/auth.service';

@Component({
  selector: 'app-my-questions',
  imports: [
    DatePipe,
    NavbarComponent,
    NgForOf,
    RouterLink,
    NgIf
  ],
  templateUrl: './my-questions.component.html',
  styleUrl: './my-questions.component.css'
})
export class MyQuestionsComponent implements OnInit {
  questions: any[] = [];
  currentPage = 0;
  totalPages = 0;
  pageSize = 10;

  constructor(private router: Router, private questionService: QuestionService, private authService: AuthService) {}

  ngOnInit() {
    this.loadMyQuestions();
  }

  loadMyQuestions(page: number = 0) {
    const email = this.authService.getUser()?.email;
    if (email) {
      this.questionService.getMyQuestions(email, this.currentPage, this.pageSize)
        .subscribe(response => {
          this.questions = response.content;
          this.totalPages = response.totalPages;
        });
    }
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadMyQuestions();
    }
  }

  onAskClick(): void {
    console.log('onAskClick');
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/question-form']).then();
    }
  }

  onEditQuestion(questionId: number): void {
    this.router.navigate(['/question-form', questionId]).then(() => {
    });
  }

  onDeleteQuestion(questionId: number): void {
    if (confirm('Are you sure you want to delete this question?')) {
      this.questionService.deleteQuestion(questionId).subscribe({
        next: () => {
          this.questions = this.questions.filter(q => q.id !== questionId);
          this.router.navigate(['/my-questions']).then();
        },
        error: err => {
          console.error('Failed to delete question', err);
          alert('An error occurred while deleting the question.');
        }
      });
    }
  }

}
