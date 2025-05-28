import {Injectable} from '@angular/core';
import {HttpService} from '@core/services/http.service';
import {Observable} from 'rxjs';
import {Endpoints} from '@core/endpoints';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {

  constructor(private readonly httpService: HttpService) {}

  createAnswer(questionId: number, content: string): Observable<any> {
    const answerData = {
      content: content
    };
    return this.httpService.post(`${Endpoints.ANSWERS}/${questionId}`, answerData);
  }

  getAnswersByQuestionId(questionId: number): Observable<any> {
    return this.httpService.get(`${Endpoints.ANSWERS}/${questionId}`);
  }
}
