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
    this.tagService.getAllTags().subscribe({
      next: (tags) => {
        this.tags = tags;
        this.filteredTags = [...tags];
      },
      error: (err) => {
        this.errorMessage = 'Error loading tags';
        console.error(err);
      }
    });
  }

  searchTags(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredTags = [...this.tags];
      return;
    }

    this.tagService.searchTags(this.searchQuery).subscribe({
      next: (tags) => {
        this.filteredTags = tags;
      },
      error: (err) => {
        this.errorMessage = 'Error searching tags';
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
