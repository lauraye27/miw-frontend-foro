import {Comment} from '@core/models/comment.model';

export interface Answer {
  id: string;
  content: string;
  author: string;
  questionId: string;
  creationDate: Date;
  comments: Comment[];
}
