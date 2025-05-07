import {Injectable} from '@angular/core';
import {HttpService} from '@core/services/http.service';
import {Observable} from 'rxjs';
import {Endpoints} from '@core/endpoints';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {

  constructor(private readonly httpService: HttpService) {}

  createAnswer(questionId: string, answer: { content: string }): Observable<any> {
    return this.httpService.post(`${Endpoints.QUESTIONS}/${questionId}/answers`, answer);
  }
}
