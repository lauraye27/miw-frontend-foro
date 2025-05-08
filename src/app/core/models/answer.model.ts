import {Comment} from '@core/models/comment.model';

export interface Answer {
  id: number;
  content: string;
  author: string;
  questionId: number;
  creationDate: Date;
  comments: Comment[];
}
