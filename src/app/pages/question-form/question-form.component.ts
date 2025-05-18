import {Component, OnInit} from '@angular/core';
import {NavbarComponent} from '../../navbar/navbar.component';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {QuestionService} from '@core/services/question.service';
import {MessageComponent} from '../../shared/message/message.component';

@Component({
  selector: 'app-question-form',
  imports: [
    NavbarComponent,
    FormsModule,
    MessageComponent
  ],
  templateUrl: './question-form.component.html',
  styleUrl: './question-form.component.css'
})
export class QuestionFormComponent implements OnInit {
  question = {
    title: '',
    description: ''
  };
  isEditMode = false;
  questionId: number | null = null;

  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private questionService: QuestionService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.questionId = Number(id);
      this.isEditMode = true;
      this.loadQuestion(this.questionId);
    }
  }

  loadQuestion(id: number): void {
    this.questionService.getQuestionById(id).subscribe({
      next: (data) => {
        this.question = {
          title: data.title,
          description: data.description
        };
      },
      error: (error) => {
        console.error('Error loading question:', error);
        this.errorMessage = 'Failed to load the question';
      }
    });
  }

  submitQuestion(): void {
    if (this.isEditMode && this.questionId) {
      this.questionService.updateQuestion(this.questionId, this.question).subscribe({
        next: () => {
          this.successMessage = 'Question updated successfully';
          this.router.navigate(['/foro']).then();
        },
        error: (error) => {
          console.error('Error updating question:', error);
          this.errorMessage = 'Failed to update question';
        }
      });
    } else {
      this.questionService.createQuestion(this.question).subscribe({
        next: () => {
          this.successMessage = 'Question created successfully!';
          this.router.navigate(['/foro']).then();
        },
        error: (error) => {
          console.error('Error creating question:', error);
          this.errorMessage = 'Failed to create question';
        }
      });
    }
  }
}
