export interface User {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'manager' | 'employee';
  avatar?: string;
  agencyId?: string;
  dateNaissance?: string;
  readNotifications: {
    [contactId: string]: string[]; // Array of comment IDs that have been read
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}