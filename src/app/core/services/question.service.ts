import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {HttpService} from '@core/services/http.service';
import {catchError} from 'rxjs/operators';
import {Endpoints} from '@core/endpoints';
import {Question} from '@core/models/question.model';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(private readonly httpService: HttpService) { }

  createQuestion(question: any): Observable<Question> {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('Error: Token not found');
      return throwError(() => new Error('User token not found'));
    }

    return this.httpService.post(Endpoints.QUESTIONS, question).pipe(
      catchError(error => {
        console.error('Error creating question-form:', error);
        return throwError(() => error);
      })
    );
  }

  updateQuestion(questionId: number, questionData: any): Observable<Question> {
    return this.httpService.put(`${Endpoints.QUESTIONS}/${questionId}`, questionData);
  }

  deleteQuestion(questionId: number): Observable<void> {
    return this.httpService.delete(`${Endpoints.QUESTIONS}/${questionId}`);
  }

  getQuestions(page: number = 0, sortBy: string = 'creationDate', sortDirection: string = 'desc', unanswered?: boolean, tag?: string): Observable<any> {
    let params = `?page=${page}&size=10&sortBy=${sortBy}&sortDirection=${sortDirection}`;
    if (unanswered) {
      params += `&unanswered=${unanswered}`;
    }
    if (tag) {
      params += `&tag=${encodeURIComponent(tag)}`;
    }
    return this.httpService.get(`${Endpoints.QUESTIONS}${params}`);
  }

  getMyQuestions(page: number = 0): Observable<any> {
    return this.httpService.get(`${Endpoints.QUESTION_MY}?page=${page}&size=10&sortBy=creationDate&sortDirection=desc`);
  }

  getQuestionById(id: number): Observable<Question> {
    return this.httpService.get(`${Endpoints.QUESTIONS}/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching question by id:', error);
        return throwError(() => error);
      })
    );
  }

  incrementViews(id: number): Observable<any> {
    return this.httpService.patch(
      `${Endpoints.QUESTIONS}/${id}/views`
    ).pipe(
      catchError(error => {
        console.error('Error incrementing question views:', error);
        return throwError(() => error);
      })
    );
  }

  searchQuestionsAndAnswers(query: string, page: number = 0, size: number = 10): Observable<any> {
    console.log('Searching for:', query);
    return this.httpService.get(
      `${Endpoints.QUESTIONS}/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`
    ).pipe(
      catchError(error => {
        console.error('Error searching questions:', error);
        return throwError(() => error);
      })
    );
  }
}
