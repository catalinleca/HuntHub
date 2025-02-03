import { inject, injectable } from 'inversify';
import { AuthResponse, LoginCredentials, SignUpCredentials } from '@/types/Auth';
import { AppError } from '@/utils/errors/AppError';
import { IUserService } from '@/services/user.service';
import { TYPES } from '@/types';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, adminAuth } from '@/config/firebase';

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  signUp(credentials: SignUpCredentials): Promise<AuthResponse>;
  refreshToken(token: string): Promise<{ accessToken: string }>;
}

@injectable()
export class AuthService implements IAuthService {
  private auth = auth;

  constructor(@inject(TYPES.UserService) private userService: IUserService) {}

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const userCredentials = await signInWithEmailAndPassword(this.auth, credentials.email, credentials.password);

      const idToken = await userCredentials.user.getIdToken();
      const refreshToken = userCredentials.user.refreshToken;

      const user = await this.userService.createOrUpdateUser({
        firebaseId: userCredentials.user.uid,
        email: userCredentials.user.email || '',
        displayName: userCredentials.user.displayName || undefined,
      });

      console.log('===user: ', user);

      return {
        accessToken: idToken,
        refreshToken: refreshToken,
      };
    } catch (error) {
      this.handleFirebaseError(error);
    }
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    try {
      const { email, password, displayName } = credentials;
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('===userCredential: ', userCredential);

      const token = await userCredential.user.getIdToken();

      const user = await this.userService.createOrUpdateUser({
        firebaseId: userCredential.user.uid,
        email: userCredential.user.email || '',
        displayName: displayName,
      });
      console.log('===user: ', user);

      return {
        accessToken: token,
      };
    } catch (error) {
      this.handleFirebaseError(error);
    }
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      const newToken = await adminAuth.createCustomToken(decodedToken.uid);

      return { accessToken: newToken };
    } catch (err) {
      this.handleFirebaseError(err);
    }
  }

  private handleFirebaseError(error: any): never {
    const errorCode = error.code;
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        throw new AppError('Invalid email or password', 401);
      case 'auth/invalid-email':
        throw new AppError('Invalid email format', 400);
      case 'auth/user-disabled':
        throw new AppError('Account has been disabled', 403);
      case 'auth/too-many-requests':
        throw new AppError('Too many login attempts. Please try again later', 429);
      default:
        throw new AppError('Authentication failed', 500);
    }
  }
}
