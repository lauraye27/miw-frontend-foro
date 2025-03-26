import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {JwtHelperService} from '@auth0/angular-jwt';

import {HttpService} from '@core/services/http.service';
import {environment} from '@env';
import {User} from '@core/models/user.model';
import {Role} from '@core/models/role.model';


@Injectable({providedIn: 'root'})
export class AuthService {
  static readonly USER = '/user';
  static readonly USER_ENDPOINT = environment.REST_USER + AuthService.USER;
  static readonly LOGIN_ENDPOINT = AuthService.USER_ENDPOINT + '/login';
  static readonly VERIFY_PASSWORD_ENDPOINT = AuthService.USER_ENDPOINT + '/verifyPassword';
  static readonly REGISTER_ENDPOINT = AuthService.USER_ENDPOINT + '/register';

  private readonly userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  private readonly jwtHelper = new JwtHelperService();

  constructor(private readonly httpService: HttpService, private readonly router: Router) {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      this.setUserFromToken(localStorage.getItem('token'));
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.httpService.post(AuthService.LOGIN_ENDPOINT, { email, password }).pipe(
      tap((response: any) => {
        const token = response.token;
        localStorage.setItem('token', token);
        this.setUserFromToken(token);
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  register(user: { firstName: string; lastName: string; userName: string; phone: string; email: string; password: string }): Observable<any> {
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
    const token = localStorage.getItem('token');
    console.log('Obteniendo token en auth.service:', token);
    return token;
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  private setUserFromToken(token: string) {
    const decodedToken = this.jwtHelper.decodeToken(token);
    if (!decodedToken || !decodedToken.id) {
      console.error('Invalid token:', decodedToken);
      return;
    }

    const user: User = {
      id: decodedToken.id,
      firstName: decodedToken.firstName,
      lastName: decodedToken.lastName,
      userName: decodedToken.userName,
      phone: decodedToken.phone,
      email: decodedToken.email,
      role: decodedToken.role,
      token: token
    };
    this.userSubject.next(user);
    console.log('User set from token:', user);
  }

  getUserDetails(): Observable<User> {
    const user = this.getUser();
    if (!user || !user.id) {
      return throwError(() => new Error());
    }

    return this.httpService.get(`${AuthService.USER_ENDPOINT}/${user.id}`).pipe(
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

  updateUser(updatedUser: any): Observable<any> {
    const userId = this.getUser()?.id;

    if (!userId) {
      return throwError(() => new Error('User ID not found'));
    }
    const token = this.getToken();
    if (!token) {
      console.error('Error: Token no encontrado');
      return throwError(() => new Error('User token no encontrado'));
    }

    return this.httpService.put(`${AuthService.USER_ENDPOINT}/update/${userId}`, updatedUser).pipe(
      catchError(error => {
        console.error('Error updating user:', error);
        return throwError(() => error);
      })
    );
  }

  deleteUser(userId: number): Observable<any> {
    return this.httpService.delete(`${AuthService.USER_ENDPOINT}/delete/${userId}`);
  }
}
