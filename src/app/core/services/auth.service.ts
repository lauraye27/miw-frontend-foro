import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {JwtHelperService} from '@auth0/angular-jwt';

import {HttpService} from '@core/services/http.service';
import {User, UserPage} from '@core/models/user.model';
import {Role} from '@core/models/role.model';
import {Endpoints} from '@core/endpoints';


@Injectable({providedIn: 'root'})
export class AuthService {

  private readonly userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  private readonly jwtHelper = new JwtHelperService();

  constructor(private readonly httpService: HttpService, private readonly router: Router) {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      this.setUserFromToken(localStorage.getItem('token'));
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.httpService.post(Endpoints.LOGIN, { email, password }).pipe(
      tap((response: any) => {
        const token = response.token;
        localStorage.setItem('token', token);
        this.setUserFromToken(token);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  register(user: { firstName: string; lastName: string; userName: string; phone: string; email: string; password: string }): Observable<any> {
    return this.httpService
      .post(Endpoints.REGISTER, user)
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
    this.router.navigate(['/login']).then();
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.httpService.post(Endpoints.USERS, user).pipe(
      map(response => {
        console.log('User created', response);
        return response;
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
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

  getToken(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  getUsers(page: number = 0): Observable<UserPage> {
    return this.httpService.get(`${Endpoints.USERS}?page=${page}&size=10&sortBy=id&sortDirection=asc`);
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
      email: decodedToken.email,
      role: decodedToken.role as Role,
      token: token
    };
    this.userSubject.next(user);
  }

  getUserDetails(): Observable<User> {
    const user = this.getUser();
    if (!user || !user.id) {
      return throwError(() => new Error());
    }

    return this.httpService.get(`${Endpoints.USERS}/${user.id}`).pipe(
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

    return this.httpService.post(Endpoints.FORGOT_PASSWORD, { userId, currentPassword }).pipe(
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
      console.error('Error: Token not found');
      return throwError(() => new Error('User token not found'));
    }

    return this.httpService.put(`${Endpoints.USERS}/${userId}`, updatedUser).pipe(
      catchError(error => {
        console.error('Error updating user:', error);
        return throwError(() => error);
      })
    );
  }

  deleteUser(userId: number): Observable<any> {
    return this.httpService.delete(`${Endpoints.USERS}/${userId}`);
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.httpService.post(
      Endpoints.FORGOT_PASSWORD,
      { email }
    ).pipe(
      tap(response => console.log('Response:', response)),
      catchError(error => {
        if (error.status === 404) {
          throw new Error('User not found');
        } else if (error.status === 500) {
          throw new Error('Server error occurred');
        } else {
          throw new Error('Failed to send reset email');
        }
      })
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.httpService.post(
      Endpoints.RESET_PASSWORD,
      { token, newPassword }
    );
  }
}
