import {Component, OnInit} from '@angular/core';
import {NavbarComponent} from '../../navbar/navbar.component';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {QuestionService} from '@core/services/question.service';
import {AuthService} from '@core/services/auth.service';
import {AnswerService} from '@core/services/answer.service';
import {CommentService} from '@core/services/comment.service';
import {MessageComponent} from '../../shared/message/message.component';

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
  question: any | null = null;
  newAnswer: { content: string } = { content: '' };
  newComments: { [key: string]: string } = {};

  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    private questionService: QuestionService,
    private answerService: AnswerService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadQuestion(Number(id));
    } else {
      this.errorMessage = 'Question ID not provided';
    }
  }

  loadQuestion(id: number): void {
    this.questionService.getQuestionById(id).subscribe({
      next: (question) => {
        this.question = question;
        this.questionService.incrementViews(id).subscribe();
      },
      error: (err) => console.error('Error loading question', err)
    });
  }

  isQuestionAuthor(): boolean {
    return this.authService.getUser()?.email === this.question?.authorEmail;
  }

  addAnswer(): void {
    if (!this.question?.id) return;

    this.answerService.createAnswer(this.question.id, this.newAnswer).subscribe({
      next: (answer) => {
        if (this.question) {
          this.question.answers = [...(this.question.answers || []), answer];
          this.newAnswer = { content: '' };
        }
      },
      error: (err) => console.error('Error posting answer', err)
    });
  }

  addComment(answer: any): void {
    const commentContent = this.newComments[answer.id];
    if (!commentContent || !answer.id || !this.question?.id) return;

    this.commentService.createComment(this.question.id, answer.id, { content: commentContent }).subscribe({
      // next: (comment) => {
      //   answer.comments = [...(answer.comments || []), comment];
      //   this.newComments[answer.id] = '';
      // },
      next: (comment) => {
        if (!answer.comments) {
          answer.comments = [];
        }
        answer.comments.push(comment);
        this.newComments[answer.id] = '';
      },
      error: (err) => console.error('Error posting comment', err)
    });
  }
}
