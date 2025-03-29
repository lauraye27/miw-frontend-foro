import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EMPTY, Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

import {AppError} from '@core/models/app-error.model';

@Injectable({providedIn: 'root'})
export class HttpService {
  static readonly CONNECTION_REFUSE = 0;
  static readonly UNAUTHORIZED = 401;

  private headers: HttpHeaders;
  private params: HttpParams;
  private responseType: string;
  private successfulMessage = undefined;
  private errorMessage = undefined;

  constructor(private readonly http: HttpClient, private readonly snackBar: MatSnackBar, private readonly router: Router) {
    this.resetOptions();
  }

  param(key: string, value: string): this {
    if (value != null) {
      this.params = this.params.append(key, value); // This class is immutable
    }
    return this;
  }

  paramsFrom(dto: any): this {
    Object.getOwnPropertyNames(dto)
      .forEach(item => this.param(item, dto[item]));
    return this;
  }

  successful(notification = 'Successful'): this {
    this.successfulMessage = notification;
    return this;
  }

  error(notification: string): this {
    this.errorMessage = notification;
    return this;
  }

  pdf(): this {
    this.responseType = 'blob';
    this.header('Accept', 'application/pdf , application/json');
    return this;
  }

  post(endpoint: string, body?: object): Observable<any> {
    return this.http
      .post(endpoint, body, this.createOptions())
      .pipe(
        map(response => this.extractData(response)),
        catchError(error => this.handleError(error))
      );
  }

  get(endpoint: string): Observable<any> {
    return this.http
      .get(endpoint, this.createOptions())
      .pipe(
        map(response => this.extractData(response)),
        catchError(error => this.handleError(error))
      );
  }

  put(endpoint: string, body?: object): Observable<any> {
    return this.http
      .put(endpoint, body, this.createOptions())
      .pipe(
        map(response => this.extractData(response)),
        catchError(error => this.handleError(error))
      );
  }

  patch(endpoint: string, body?: object): Observable<any> {
    return this.http
      .patch(endpoint, body, this.createOptions())
      .pipe(
        map(response => this.extractData(response)),
        catchError(error => this.handleError(error))
      );
  }

  delete(endpoint: string): Observable<any> {
    return this.http
      .delete(endpoint, this.createOptions())
      .pipe(
        map(response => this.extractData(response)),
        catchError(error => this.handleError(error)));
  }

  authBasic(email: string, password: string): HttpService {
    return this.header('Authorization', 'Basic ' + btoa(email + ':' + password));
  }

  header(key: string, value: string): HttpService {
    if (value != null) {
      this.headers = this.headers.append(key, value); // This class is immutable
    }
    return this;
  }

  private resetOptions(): void {
    this.headers = new HttpHeaders();
    this.params = new HttpParams();
    this.responseType = 'json';
  }

  private createOptions(): any {
    const options: any = {
      headers: this.headers,
      params: this.params,
      responseType: this.responseType,
      observe: 'response'
    };
    this.resetOptions();
    return options;
  }

  private extractData(response): any {
    if (this.successfulMessage) {
      this.snackBar.open(this.successfulMessage, '', {
        duration: 2000
      });
      this.successfulMessage = undefined;
    }
    const contentType = response.headers.get('content-type');
    if (contentType) {
      if (contentType.indexOf('application/pdf') !== -1) {
        const blob = new Blob([response.body], {type: 'application/pdf'});
        window.open(window.URL.createObjectURL(blob));
      } else if (contentType.indexOf('application/json') !== -1) {
        return response.body; // with 'text': JSON.parse(response.body);
      }
    } else {
      return response;
    }
  }

  private showError(notification: string): void {
    this.errorMessage = notification;
  }

  private handleError(response: any): Observable<any> {
    let errorMessage = 'An unexpected error occurred';
    const status = response?.status || null;

    if (status === HttpService.UNAUTHORIZED) {
      this.showError('Unauthorized');
    } else if (status === HttpService.CONNECTION_REFUSE) {
      this.showError('Connection Refused');
      return EMPTY;
    } else if (status === 400) {
      errorMessage = 'Invalid data provided';
    } else if (status === 409) {
      const errorMsg = response.error?.message;
        if (errorMsg.toLowerCase().includes('email')) {
          errorMessage = 'The email is already registered';
        } else if (errorMsg.toLowerCase().includes('username')) {
          errorMessage = 'The username is already taken';
        } else {
          errorMessage = 'A conflict occurred, please check your data';
        }
    } else if (status === 500) {
      errorMessage = 'A server error occurred. Please try again later';
    }

    this.showError(errorMessage + ` (${status})`);
    return throwError(() => response);
  }

}
