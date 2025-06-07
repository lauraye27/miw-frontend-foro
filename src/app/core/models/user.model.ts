import {Role} from './role.model';

export interface User {
  id: number;
  token: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  phone?: string;
  email?: string;
  password?: string;
  role?: Role;
}

export interface UserPage {
  content: User[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}
