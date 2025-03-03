import {Role} from './role.model';

export interface User {
  token: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: Role;
}
