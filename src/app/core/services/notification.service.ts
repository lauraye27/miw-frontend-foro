import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpService} from '@core/services/http.service';
import {Endpoints} from '@core/endpoints';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private readonly httpService: HttpService) { }

  getNotifications(): Observable<Notification[]> {
    return this.httpService.get(Endpoints.NOTIFICATIONS);
  }

  getUnreadCount(): Observable<number> {
    return this.httpService.get(`${Endpoints.NOTIFICATIONS}/unread-count`);
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.httpService.patch(`${Endpoints.NOTIFICATIONS}/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.httpService.patch(`${Endpoints.NOTIFICATIONS}/mark-all-read`, {});
  }
}
