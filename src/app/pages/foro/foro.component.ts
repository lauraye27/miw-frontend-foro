import { Component } from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '@core/services/auth.service';
import {QuestionService} from '@core/services/question.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [NavbarComponent, NgForOf, RouterLink, DatePipe, NgIf],
  templateUrl: './foro.component.html',
  styleUrl: './foro.component.css',
})
export class foroComponent {

  questions: any[] = [];
  currentPage: number;
  totalPages: number;
  visiblePages: number[] = [0];

  constructor(private router: Router, protected authService: AuthService, private questionService: QuestionService) {}

  ngOnInit() {
    this.loadQuestions();
  }

  loadQuestions(page: number = 0): void {
    this.questionService.getQuestions(page).subscribe({
      next: (res) => {
        this.questions = res.content;
        this.currentPage = res.page.number;
        this.totalPages = res.page.totalPages;
        this.updateVisiblePages();
      },
      error: (err) => console.error('Error loading questions', err)
    });
  }

  onAskClick(): void {
    console.log('onAskClick');
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/question-form']).then();
    }
  }

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages && newPage !== this.currentPage) {
      this.loadQuestions(newPage);
    }
  }

  updateVisiblePages(): void {
    const maxVisible = 5;
    this.visiblePages = [];

    if (this.totalPages <= maxVisible) {
      for (let i = 0; i < this.totalPages; i++) {
        this.visiblePages.push(i);
      }
    } else {
      let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages - 1, start + maxVisible - 1);

      if (end === this.totalPages - 1) {
        start = Math.max(0, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        this.visiblePages.push(i);
      }
    }
  }
}
