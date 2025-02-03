export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: {
    uid: string;
    email: string;
    displayName: string;
  };
}
