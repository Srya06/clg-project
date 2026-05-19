export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'HOD' | 'ADMIN';
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
