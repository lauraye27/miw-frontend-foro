export interface Comment {
  id: string;
  content: string;
  author: string;
  questionId: string;
  answerId: string;
  creationDate: Date;
}
