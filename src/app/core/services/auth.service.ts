import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {JwtHelperService} from '@auth0/angular-jwt';

import {HttpService} from '@core/services/http.service';
import {environment} from '@env';
import {User} from '@core/models/user.model';
import {Role} from '@core/models/role.model';


@Injectable({providedIn: 'root'})
export class AuthService {
  static readonly END_POINT = environment.REST_USER + '/user/login';

  private readonly userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  private readonly jwtHelper = new JwtHelperService();

  constructor(private readonly httpService: HttpService, private readonly router: Router) {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      this.setUserFromToken(localStorage.getItem('token'));
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.httpService.post(AuthService.END_POINT, { email, password }).pipe(
      map(jsonToken => {
        localStorage.setItem('token', jsonToken.token);
        this.setUserFromToken(jsonToken.token);
        return this.userSubject.value;
      })
    );
  }

  register(user: { firstName: string; lastName: string; email: string; password: string }): Observable<any> {
    return this.httpService
      .post(environment.REST_USER + '/user/register', user)
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

  untilManager(): boolean {
    return this.hasRoles([Role.ADMIN, Role.MANAGER]);
  }

  untilOperator(): boolean {
    return this.hasRoles([Role.ADMIN, Role.MANAGER, Role.OPERATOR]);
  }

  isCustomer(): boolean {
    return this.hasRoles([Role.CUSTOMER]);
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
      email: decodedToken.name,
      role: decodedToken.role,
      token: token
    };
    this.userSubject.next(user);
  }

}
