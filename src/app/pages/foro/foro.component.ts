import { Component } from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '@core/services/auth.service';
import {QuestionService} from '@core/services/question.service';
import {DatePipe, NgForOf} from '@angular/common';

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [NavbarComponent, NgForOf, RouterLink, DatePipe],
  templateUrl: './foro.component.html',
  styleUrl: './foro.component.css',
})
export class foroComponent {

  questions: any[] = [];
  currentPage = 0;
  totalPages = 0;

  constructor(private router: Router, protected authService: AuthService, private questionService: QuestionService) {}

  ngOnInit() {
    this.loadQuestions();
  }

  loadQuestions(page: number = 0) {
    this.questionService.getQuestions(page).subscribe(res => {
      this.questions = res.content;
      this.currentPage = res.number;
      this.totalPages = res.totalPages;
    });
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.loadQuestions(page);
    }
  }

  onAskClick(): void {
    console.log('onAskClick');
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/question-form']).then();
    }
  }
}
