import {Answer} from '@core/models/answer.model';

export interface Question {
  id: string;
  title: string;
  description: string;
  author: string;
  authorEmail: string;
  creationDate: Date;
  views: number;
  tags: string[];
  answers: Answer[];
}
