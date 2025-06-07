export interface Answer {
  id: number;
  content: string;
  author: string;
  questionId: number;
  creationDate: Date;
}

export interface AnswerForm {
  content: string;
  author: string;
  questionId: number;
}
