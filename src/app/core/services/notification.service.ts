import {Injectable, NgZone} from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {Endpoints} from '@core/endpoints';
import {HttpService} from '@core/services/http.service';
import {Notification} from '@core/models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  private readonly stompClient: Client;
  private readonly notificationSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationSubject.asObservable();

  constructor(private readonly httpService: HttpService, private readonly ngZone: NgZone) {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(Endpoints.WS_NOTIFICATIONS),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
    });
  }

  connect(userId: number): void {
    this.stompClient.onConnect = (frame) => {
      this.stompClient.subscribe(
        `${Endpoints.TOPIC_NOTIFICATIONS}/${userId}`,
        (message) => {
          const notification = JSON.parse(message.body);
          this.ngZone.run(() => {
            this.addNotification(notification);
          });        }
      );
    };
    this.stompClient.onStompError = (frame) => {
      console.error('Error STOMP connection:', frame.headers['message']);
    };

    this.stompClient.activate();
  }

  private addNotification(notification: Notification): void {
    const current = this.notificationSubject.getValue();
    this.notificationSubject.next([notification, ...current]);
  }

  getStoredNotifications(): void {
    this.httpService.get(Endpoints.NOTIFICATIONS).subscribe({
      next: (notifications) => {
        this.notificationSubject.next(notifications);
      },
      error: (err) => console.error('Error fetching notifications', err)
    });
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.httpService.patch(`${Endpoints.NOTIFICATIONS}/${notificationId}/read`, {}).pipe(
      tap(() => {
        const current = this.notificationSubject.getValue();
        const updated = current.map(n =>
          n.id === notificationId ? {...n, read: true} : n
        );
        this.notificationSubject.next(updated);
      })
    );
  }

  disconnect(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.deactivate().then(() => {
        console.log('Disconnected');
      });
    }
  }
}
