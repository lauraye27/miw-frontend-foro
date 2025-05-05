import {Component, OnInit} from '@angular/core';
import {NavbarComponent} from '../../navbar/navbar.component';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {QuestionService} from '@core/services/question.service';

@Component({
  selector: 'app-question-form',
  imports: [
    NavbarComponent,
    FormsModule
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
  questionId: string | null = null;

  constructor(
    private questionService: QuestionService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.questionId = this.route.snapshot.paramMap.get('id');
    if (this.questionId) {
      console.log("QUEST " + this.questionId);
      this.isEditMode = true;
      this.loadQuestion(this.questionId);
    }
  }

  loadQuestion(id: string): void {
    this.questionService.getQuestionById(id).subscribe({
      next: (data) => {
        this.question = {
          title: data.title,
          description: data.description
        };
      },
      error: (error) => {
        console.error('Error loading question:', error);
        alert('Failed to load the question.');
      }
    });
  }

  submitQuestion(): void {
    if (this.isEditMode && this.questionId) {
      this.questionService.updateQuestion(this.questionId, this.question).subscribe({
        next: () => {
          alert('Question updated successfully!');
          this.router.navigate(['/foro']).then();
        },
        error: (error) => {
          console.error('Error updating question:', error);
          alert('Failed to update question.');
        }
      });
    } else {
      this.questionService.createQuestion(this.question).subscribe({
        next: () => {
          alert('Question created successfully!');
          this.router.navigate(['/foro']).then();
        },
        error: (error) => {
          console.error('Error creating question:', error);
          alert('Failed to create question.');
        }
      });
    }
  }

  // submitQuestion(): void {
  //   this.questionService.createQuestion(this.question).subscribe({
  //     next: () => {
  //       alert('Question created successfully!');
  //       this.router.navigate(['/foro']).then();
  //     },
  //     error: (error) => {
  //       console.error('Error creating question-form:', error);
  //       alert('Failed to create question-form. Please try again.');
  //     }
  //   });
  // }
}
