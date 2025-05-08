export interface Notification {
  id: number;
  userId: number;
  type: 'ANSWER' | 'COMMENT' | 'REPLY';
  message: string;
  questionId?: number;
  answerId?: number;
  // commentId?: number;
  read: boolean;
  createdAt: Date;
}
