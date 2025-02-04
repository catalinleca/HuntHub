export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  displayName: string;
}

// TODO: move into headers when the app is ready
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
}
