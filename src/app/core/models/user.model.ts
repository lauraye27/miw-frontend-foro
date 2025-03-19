import {Role} from './role.model';

export interface User {
  id?: number;
  token: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: Role;
}
