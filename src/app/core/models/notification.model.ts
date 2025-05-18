export interface Notification {
  id: number;
  userId: number;
  message: string;
  questionId?: number;
  answerId?: number;
  type: 'QUESTION_REPLIED' | 'ANSWER_RATED';
  read: boolean;
  creationDate: Date;
}
