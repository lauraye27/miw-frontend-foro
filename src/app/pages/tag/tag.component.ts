import {Component, OnInit} from '@angular/core';
import {MessageComponent} from '../../shared/message/message.component';
import {NavbarComponent} from '../../navbar/navbar.component';
import {QuestionService} from '@core/services/question.service';
import {Router} from '@angular/router';
import {TagService} from '@core/services/tag.service';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Tag} from '@core/models/tag.model';

@Component({
  selector: 'app-tag',
  imports: [
    MessageComponent,
    NavbarComponent,
    NgIf,
    NgForOf,
    FormsModule
  ],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.css'
})
export class TagComponent implements OnInit {
  tags: Tag[] = [];
  filteredTags: Tag[] = [];
  searchQuery: string = '';
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private tagService: TagService,
    private questionService: QuestionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllTags();
  }

  loadAllTags(): void {
    this.isLoading = true;
    this.tagService.getAllTags().subscribe({
      next: (tags) => {
        this.tags = tags;
        this.filteredTags = [...tags];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error loading tags';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  searchTags(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredTags = [...this.tags];
      return;
    }

    this.isLoading = true;
    this.tagService.searchTags(this.searchQuery).subscribe({
      next: (tags) => {
        this.filteredTags = tags;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error searching tags';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  navigateToTagQuestions(tagName: string): void {
    this.router.navigate(['/questions'], {
      queryParams: {tag: tagName}
    }).then(r =>{});
  }
}
