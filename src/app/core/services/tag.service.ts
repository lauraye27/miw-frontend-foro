import {Injectable} from '@angular/core';
import {HttpService} from '@core/services/http.service';
import {Observable} from 'rxjs';
import {Endpoints} from '@core/endpoints';
import {Tag} from '@core/models/tag.model';

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor(private readonly httpService: HttpService) { }

  getAllTags(): Observable<Tag[]> {
    return this.httpService.get(Endpoints.TAGS);
  }

  searchTags(query: string): Observable<Tag[]> {
    return this.httpService.get(`${Endpoints.TAGS}/search?query=${encodeURIComponent(query)}`);
  }

  deleteTag(id: number): Observable<void> {
    return this.httpService.delete(`${Endpoints.TAGS}/${id}`);
  }
}
