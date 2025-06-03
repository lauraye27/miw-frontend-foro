import {Injectable} from '@angular/core';
import {HttpService} from '@core/services/http.service';
import {Observable, throwError} from 'rxjs';
import {Endpoints} from '@core/endpoints';
import {Answer} from '@core/models/answer.model';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {

  constructor(private readonly httpService: HttpService) {}

  createAnswer(questionId: number, content: string): Observable<any> {
    let params = `?questionId=${questionId}`;
    const answerData = { content: content };
    return this.httpService.post(`${Endpoints.ANSWERS}${params}`, answerData);
  }

  getAnswersByQuestionId(questionId: number): Observable<any> {
    let params = `?questionId=${questionId}`;
    return this.httpService.get(`${Endpoints.ANSWERS}${params}`);
  }

  getAnswerById(id: number): Observable<Answer> {
    return this.httpService.get(`${Endpoints.ANSWERS}/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching answer by id:', error);
        return throwError(() => error);
      })
    );
  }

  getMyAnswers(page: number = 0): Observable<any> {
    return this.httpService.get(`${Endpoints.ANSWER_MY}?page=${page}&size=10&sortBy=creationDate&sortDirection=desc`);
  }

  updateAnswer(answerId: number, content: any): Observable<Answer> {
    return this.httpService.put(`${Endpoints.ANSWERS}/${answerId}`, content);
  }

  deleteAnswer(answerId: number): Observable<void> {
    return this.httpService.delete(`${Endpoints.ANSWERS}/${answerId}`);
  }
}
