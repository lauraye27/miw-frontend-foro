import {Component, OnInit} from '@angular/core';
import {AuthService} from '@core/services/auth.service';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {User} from '@core/models/user.model';
import {Router, RouterLink} from '@angular/router';
import {Notification} from '@core/models/notification.model';
import {NotificationService} from '@core/services/notification.service';
import {SearchBarComponent} from '../search-bar/search-bar.component';
import {Question} from '@core/models/question.model';
import {QuestionService} from '@core/services/question.service';
import {TruncatePipe} from '@core/truncate.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    NgForOf,
    RouterLink,
    SearchBarComponent,
    SearchBarComponent,
    TruncatePipe
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {

  isAuthenticated = false;
  firstName: string = '';
  lastName: string = '';
  user: User | null = null;

  searchQuery = '';
  searchResults: Question[] | null = null;
  showSearchResults = false;

  unreadNotifications = 0;
  notifications: Notification[] = [];

  constructor(protected authService: AuthService, private router: Router, private notificationService: NotificationService,
              private questionService: QuestionService) { }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.isAuthenticated = !!user;
      if (user) {
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.loadNotifications();
      }
    });
  }

  get userNameInitials(): string {
    const firstInitial = this.firstName ? this.firstName.charAt(0).toUpperCase() : '';
    const lastInitial = this.lastName ? this.lastName.charAt(0).toUpperCase() : '';
    return (firstInitial + lastInitial) || '?';
  }

  onSearch(query: string): void {
    this.searchQuery = query.trim();
    if (!this.searchQuery) {
      this.searchResults = null;
      this.showSearchResults = false;
      return;
    }

    this.questionService.searchQuestions(this.searchQuery, 0, 5).subscribe({
      next: response => {
        this.searchResults = response?.content || [];
        this.showSearchResults = true;
      },
      error: err => {
        console.error('Search error:', err);
        this.searchResults = null;
        this.showSearchResults = false;
      }
    });
  }

  onLiveResults(results: any[]) {
    this.searchResults = results;
    this.showSearchResults = results.length > 0;
  }

  hideSearchResults(): void {
    setTimeout(() => {
      this.showSearchResults = false;
    }, 200);
  }

  navigateToQuestion(questionId: string): void {
    this.showSearchResults = false;
    this.searchQuery = '';
    this.searchResults = null;
    this.router.navigate(['/question', questionId]).then(r => {});
  }

  loadNotifications(): void {
    // if (this.isAuthenticated) {
    //   this.notificationService.getNotifications().subscribe(notifications => {
    //     //this.notifications = notifications;
    //     //this.unreadNotifications = notifications.filter(n => !n.read).length;
    //   });
    // }
  }

  getNotificationIcon(type: string): string {
    switch(type) {
      case 'ANSWER': return 'reply';
      case 'COMMENT': return 'comment';
      case 'REPLY': return 'comments';
      default: return 'bell';
    }
  }

  viewNotification(notification: Notification): void {
    // this.notificationService.markAsRead(notification.id).subscribe(() => {
    //   this.loadNotifications();
    // });

    if (notification.questionId) {
      this.router.navigate(['/notification', notification.questionId]).then(r => {});
    }
  }

  logout() {
    this.authService.logout();
  }

}
