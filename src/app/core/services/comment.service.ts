import {Injectable} from '@angular/core';
import {HttpService} from '@core/services/http.service';
import {Observable} from 'rxjs';
import {Endpoints} from '@core/endpoints';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  constructor(private readonly httpService: HttpService) {}

  createComment(questionId: string, answerId: string, comment: { content: string }): Observable<Comment> {
    return this.httpService.post(`${Endpoints.QUESTIONS}/${questionId}/answers/${answerId}/comments`, comment);
  }
}
