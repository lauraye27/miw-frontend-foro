import {Component, OnInit} from '@angular/core';
import {NavbarComponent} from '../../navbar/navbar.component';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {QuestionService} from '@core/services/question.service';
import {MessageComponent} from '../../shared/message/message.component';
import {NgForOf, NgIf} from '@angular/common';
import {TagService} from '@core/services/tag.service';
import {QuestionForm} from '@core/models/question.model';

@Component({
  selector: 'app-question-form',
  imports: [
    NavbarComponent,
    FormsModule,
    MessageComponent,
    NgForOf,
    NgIf
  ],
  templateUrl: './question-form.component.html',
  styleUrl: './question-form.component.css'
})
export class QuestionFormComponent implements OnInit {
  question: QuestionForm = {
    title: '',
    description: '',
    tags: []
  };

  isEditMode = false;
  questionId: number | null = null;

  newTag = '';
  filteredTags: string[] = [];

  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private questionService: QuestionService,
    private tagService: TagService,
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
          description: data.description,
          tags: data.tags || []
        };
      },
      error: (error) => {
        console.error('Error loading question:', error);
        this.errorMessage = 'Failed to load the question';
      }
    });
  }

  addTag(): void {
    const tag = this.newTag.trim().toLowerCase();
    if (tag && !this.question.tags.includes(tag) && this.question.tags.length < 5) {
      this.question.tags.push(tag);
      this.newTag = '';
      this.filteredTags = [];
    }
  }

  removeTag(tag: string): void {
    this.question.tags = this.question.tags.filter(t => t !== tag);
  }

  onTagInputChange(): void {
    const input = this.newTag.trim().toLowerCase();

    if (input.length > 0) {
      this.tagService.searchTags(input).subscribe({
        next: (tags) => {
          this.filteredTags = tags
            .map(tag => tag.name)
            .filter(tagName =>
              !this.question.tags.includes(tagName) &&
              tagName.includes(input)
            );
        },
        error: (err) => {
          console.error('Error searching tags:', err);
          this.filteredTags = [];
        }
      });
    } else {
      this.filteredTags = [];
    }
  }

  selectTag(tag: string): void {
    if (!this.question.tags.includes(tag) && this.question.tags.length < 5) {
      this.question.tags.push(tag);
      this.newTag = '';
      this.filteredTags = [];
    }
  }

  isTagInList(tag: string): boolean {
    const tagName = tag.trim().toLowerCase();
    return this.question.tags.includes(tagName) ||
      this.filteredTags.some(t => t.toLowerCase?.() === tagName || t?.toLowerCase?.() === tagName);
  }

  submitQuestion(): void {
    if (this.isEditMode && this.questionId) {
      this.questionService.updateQuestion(this.questionId, this.question).subscribe({
        next: () => {
          this.successMessage = 'Question updated successfully';
          this.router.navigate(['/question', this.questionId]).then();
        },
        error: (error) => {
          console.error('Error updating question:', error);
          this.errorMessage = 'Failed to update question';
        }
      });
    } else {
      this.questionService.createQuestion(this.question).subscribe({
        next: (createdQuestion) => {
          this.successMessage = 'Question created successfully';
          this.router.navigate(['/question', createdQuestion.id]).then();
        },
        error: (error) => {
          console.error('Error creating question:', error);
          this.errorMessage = 'Failed to create question';
        }
      });
    }
  }
}
