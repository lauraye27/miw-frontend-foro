import {Component, OnInit} from '@angular/core';
import {MessageComponent} from '../../shared/message/message.component';
import {FormsModule} from '@angular/forms';
import {Answer, AnswerForm} from '@core/models/answer.model';
import {ActivatedRoute, Router} from '@angular/router';
import {AnswerService} from '@core/services/answer.service';

@Component({
  selector: 'app-answer-form',
  imports: [
    FormsModule,
    MessageComponent
  ],
  templateUrl: './answer-form.component.html',
  styleUrl: './answer-form.component.css'
})

export class AnswerFormComponent implements OnInit {
  answer: AnswerForm = {
    content: '',
    author: '',
    questionId: 0,
  };

  answerId: number | null = null;
  questionId: number | null = null;

  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private readonly answerService: AnswerService,
              private readonly router: Router,
              private readonly route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const id: string = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.answerId = Number(id);
      this.loadAnswer(this.answerId);
    }
  }

  loadAnswer(id: number): void {
    this.answerService.getAnswerById(id).subscribe({
      next: (data: Answer) => {
        this.answer = {
          content: data.content,
          author: data.author,
          questionId: data.questionId,
        };
      },
      error: (error: any): void => {
        console.error('Error loading answer:', error);
        this.errorMessage = 'Failed to load the answer';
      }
    });
  }

  submitAnswer(): void {
    if (this.answerId) {
      this.answerService.updateAnswer(this.answerId, this.answer).subscribe({
        next: (): void => {
          this.successMessage = 'Successfully updated answer';
          this.router.navigate(['/my-answers']).then();
        },
        error: (error: any): void => {
          console.error('Error updating answer:', error);
          this.errorMessage = 'Failed to update answer';
        }
      });
    }
  }
}
