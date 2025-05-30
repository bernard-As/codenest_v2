// frontend/src/types/auth.ts
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'STUDENT' | 'LECTURER' | 'ADVISOR' | 'ADMIN'; // Match backend choices
  date_joined?: string;
  last_login?: string;
}

export interface Tokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials { // Extends LoginCredentials for email/password
  first_name: string;
  last_name: string;
  password2: string; // Confirm password
  role: 'STUDENT' | 'LECTURER' | 'ADVISOR'; // Roles selectable at registration
}

export interface RegisterResponse {
  user: User;
  access: string;
  refresh: string;
  message: string;
}

export interface LoginResponse extends Tokens {} // Login directly returns tokens in SimpleJWT