import {environment} from '@env';

export class Endpoints {

  static readonly USERS = `${environment.REST_API}/users`;
  static readonly LOGIN = `${Endpoints.USERS}/login`;
  static readonly REGISTER = `${Endpoints.USERS}/register`;

  static readonly FORGOT_PASSWORD = `${environment.REST_API}/account/forgot-password`;
  static readonly RESET_PASSWORD = `${environment.REST_API}/account/reset-password`;

  static readonly NOTIFICATIONS = `${environment.REST_API}/notifications`;
  static readonly WS_NOTIFICATIONS = `${environment.REST_API}/ws-notifications`;
  static readonly TOPIC_NOTIFICATIONS = `/topic/notifications`;

  static readonly QUESTIONS = `${environment.REST_API}/questions`;
  static readonly QUESTION_MY = `${Endpoints.QUESTIONS}/myQuestions`;

  static readonly ANSWERS = `${environment.REST_API}/answers`;

  static readonly TAGS = `${environment.REST_API}/tags`;
}
