export interface Notification {
  id: string;
  userId: string;
  type: 'ANSWER' | 'COMMENT' | 'REPLY';
  message: string;
  questionId?: string;
  answerId?: string;
  commentId?: string;
  read: boolean;
  createdAt: Date;
}
