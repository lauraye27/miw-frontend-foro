import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '@core/services/auth.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {User} from '@core/models/user.model';
import {Router, RouterLink} from '@angular/router';
import {Notification} from '@core/models/notification.model';
import {NotificationService} from '@core/services/notification.service';
import {SearchBarComponent} from '../search-bar/search-bar.component';
import {Question} from '@core/models/question.model';
import {QuestionService} from '@core/services/question.service';
import {TruncatePipe} from '@core/truncate.pipe';
import {Subscription} from 'rxjs';

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
    TruncatePipe,
    DatePipe
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})

export class NavbarComponent implements OnInit, OnDestroy {

  isAuthenticated = false;
  firstName: string = '';
  lastName: string = '';
  user: User | null = null;

  searchQuery = '';
  searchResults: Question[] | null = null;
  showSearchResults = false;

  unreadNotifications = 0;
  notifications: Notification[] = [];
  notificationSub: Subscription;

  constructor(protected authService: AuthService, private readonly router: Router,
              private readonly notificationService: NotificationService, private readonly questionService: QuestionService) { }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.isAuthenticated = !!user;
      if (user) {
        this.firstName = user.firstName;
        this.lastName = user.lastName;

        this.notificationService.getStoredNotifications();
        this.notificationService.connect(user.id)

        this.notificationSub = this.notificationService.notifications$.subscribe(notifications => {
          console.log('Notifications received:', notifications);
          this.notifications = notifications;
          this.unreadNotifications = notifications.filter(n => !n.read).length;
        });
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

  navigateToQuestion(questionId: number): void {
    this.showSearchResults = false;
    this.searchQuery = '';
    this.searchResults = null;
    this.router.navigate(['/question', questionId]).then();
  }

  loadNotifications(): void {
    if (this.isAuthenticated) {
      this.notificationService.getStoredNotifications();
    }
  }

  getNotificationIcon(type: string): string {
    switch(type) {
      case 'ANSWER': return 'reply';
      case 'RATED': return 'rated';
      default: return 'notification';
    }
  }

  viewNotification(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => this.navigateToNotification(notification),
        error: (err) => console.error('Error marking notification as read', err)
      });
    } else {
      this.navigateToNotification(notification);
    }
  }

  private navigateToNotification(notification: Notification): void {
    if (notification.questionId) {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/question', notification.questionId], {
          state: { highlightAnswer: notification.answerId },
          onSameUrlNavigation: 'reload'
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.notificationService.disconnect();
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
  }

  logout() {
    this.authService.logout();
  }
}
