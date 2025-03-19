import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable, switchMap, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {JwtHelperService} from '@auth0/angular-jwt';

import {HttpService} from '@core/services/http.service';
import {environment} from '@env';
import {User} from '@core/models/user.model';
import {Role} from '@core/models/role.model';
import {HttpHeaders} from '@angular/common/http';


@Injectable({providedIn: 'root'})
export class AuthService {
  static readonly LOGIN_ENDPOINT = environment.REST_USER + '/user/login';
  static readonly VERIFY_PASSWORD_ENDPOINT = environment.REST_USER + '/user/verifyPassword';
  static readonly REGISTER_ENDPOINT = environment.REST_USER + '/user/register';

  private readonly userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  private readonly jwtHelper = new JwtHelperService();

  constructor(private readonly httpService: HttpService, private readonly router: Router) {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      this.setUserFromToken(localStorage.getItem('token'));
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.httpService.post(AuthService.LOGIN_ENDPOINT, { email, password }).pipe(
      switchMap(jsonToken => {
        localStorage.setItem('token', jsonToken.token);
        this.setUserFromToken(jsonToken.token);

        return this.getUserDetails();
      }),
      tap(user => this.userSubject.next(user)),
      catchError(error => throwError(() => error))
    );
  }

  register(user: { firstName: string; lastName: string; email: string; password: string }): Observable<any> {
    return this.httpService
      .post(AuthService.REGISTER_ENDPOINT, user)
      .pipe(
        map(response => {
          console.log('User registered:', response);
          return response;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.userSubject.value != null;
  }

  hasRoles(roles: Role[]): boolean {
    return this.isAuthenticated() && roles.includes(this.userSubject.value.role);
  }

  isAdmin(): boolean {
    return this.hasRoles([Role.ADMIN]);
  }

  isMember(): boolean {
    return this.hasRoles([Role.MEMBER]);
  }

  isGuest(): boolean {
    return this.hasRoles([Role.GUEST]);
  }

  untilAuthenticated(): boolean {
    return this.hasRoles([Role.ADMIN, Role.MEMBER]);
  }

  untilNoAuthenticated(): boolean {
    return this.hasRoles([Role.ADMIN, Role.MEMBER, Role.GUEST]);
  }

  getName(): string {
    return this.userSubject.value ? this.userSubject.value.firstName : '???';
  }

  getToken(): string {
    return this.userSubject.value ? this.userSubject.value.token : undefined;
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  private setUserFromToken(token: string) {
    const decodedToken = this.jwtHelper.decodeToken(token);
    const user: User = {
      id: decodedToken.id,
      firstName: decodedToken.firstName,
      lastName: decodedToken.lastName,
      email: decodedToken.email,
      role: decodedToken.role,
      token: token
    };
    this.userSubject.next(user);
  }

  getUserDetails(): Observable<User> {
    const userId = this.getUser()?.id;
    if (!userId) {
      return throwError(() => new Error());
    }

    return this.httpService.get(`${environment.REST_USER}/user/${userId}`).pipe(
      map(user => {
        this.userSubject.next(user);
        return user;
      }),
      catchError(error => {
        console.error('Error fetching user details:', error);
        return throwError(() => error);
      })
    );
  }

  verifyCurrentPassword(currentPassword: string): Observable<boolean> {
    const userId = this.getUser()?.id;
    if (!userId) {
      return throwError(() => new Error('User ID not found'));
    }

    return this.httpService.post(AuthService.VERIFY_PASSWORD_ENDPOINT, { userId, currentPassword }).pipe(
      map(response => response.isValid),
      catchError(error => {
        console.error('Error verifying password:', error);
        return throwError(() => error);
      })
    );
  }

}
