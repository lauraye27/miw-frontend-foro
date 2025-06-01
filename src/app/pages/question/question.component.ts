import {Component, OnInit} from '@angular/core';
import {NavbarComponent} from '../../navbar/navbar.component';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {QuestionService} from '@core/services/question.service';
import {AuthService} from '@core/services/auth.service';
import {AnswerService} from '@core/services/answer.service';
import {MessageComponent} from '../../shared/message/message.component';
import {Question} from '@core/models/question.model';
import {Answer} from '@core/models/answer.model';

@Component({
  selector: 'app-question',
  imports: [
    NavbarComponent,
    NgForOf,
    NgIf,
    FormsModule,
    DatePipe,
    MessageComponent
  ],
  templateUrl: './question.component.html',
  styleUrl: './question.component.css'
})
export class QuestionComponent implements OnInit {
  question: Question | null = null;
  answers: Answer[] = [];
  newAnswer: { content: string } = { content: '' };

  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    private questionService: QuestionService,
    private answerService: AnswerService
  ) {}

  ngOnInit(): void {
    // const id = this.route.snapshot.paramMap.get('id');
    // if (id) {
    //   const questionId = Number(id);
    //   this.loadQuestion(questionId);
    //   this.loadAnswers(questionId);
    // } else {
    //   this.errorMessage = 'Question ID not provided';
    // }
    this.route.paramMap.subscribe(params => {
      const questionId = Number(params.get('id'));
      this.loadQuestion(questionId);
      this.loadAnswers(questionId);
    });
  }

  loadQuestion(id: number): void {
    this.questionService.incrementViews(id).subscribe({
      next: () => {
        this.questionService.getQuestionById(id).subscribe({
          next: (question) => {
            this.question = question;
          },
          error: (err) => console.error('Error loading question after incrementing views', err)
        });
      },
      error: (err) => console.error('Error incrementing views', err)
    });
  }

  loadAnswers(questionId: number): void {
    this.answerService.getAnswersByQuestionId(questionId).subscribe({
      next: (answers) => {
        this.answers = answers;
      },
      error: (err) => {
        console.error('Error loading answers', err);
        this.errorMessage = 'Error loading answers. Please try again';
      }
    });
  }

  // isQuestionAuthor(): boolean {
  //   return this.authService.getUser()?.email === this.question?.authorEmail;
  // }

  addAnswer(): void {
    if (!this.question?.id) return;

    this.answerService.createAnswer(this.question.id, this.newAnswer.content).subscribe({
      next: (newAnswer) => {
        this.answers = [newAnswer, ...this.answers];
        this.newAnswer.content = '';
        this.loadAnswers(this.question!.id);
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Error posting answer', err);
        this.errorMessage = 'Error posting answer. Please try again';
      }
    });
  }
}
