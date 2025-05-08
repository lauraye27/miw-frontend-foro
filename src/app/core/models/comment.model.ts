export interface Comment {
  id: number;
  content: string;
  author: string;
  questionId: number;
  answerId: number;
  creationDate: Date;
}
