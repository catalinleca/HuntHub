export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  firebaseUid?: string;
  email: string;
  password: string;
  firstName: string;
  displayName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
}
