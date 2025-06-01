import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '@core/services/auth.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {User} from '@core/models/user.model';
import {Router, RouterLink} from '@angular/router';
import {Notification} from '@core/models/notification.model';
import {NotificationService} from '@core/services/notification.service';
import {SearchBarComponent} from '../search-bar/search-bar.component';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, NgForOf, RouterLink, SearchBarComponent, DatePipe, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})

export class NavbarComponent implements OnInit, OnDestroy {

  isAuthenticated = false;
  firstName: string = '';
  lastName: string = '';
  user: User | null = null;

  searchQuery = '';

  unreadNotifications = 0;
  notifications: Notification[] = [];
  notificationSub: Subscription;

  constructor(protected authService: AuthService, private readonly router: Router,
              private readonly notificationService: NotificationService) { }

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
    this.searchQuery = query;
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
