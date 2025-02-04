import { inject, injectable } from 'inversify';
import { AuthResponse, LoginCredentials, SignUpCredentials } from '@/types/Auth';
import { AppError } from '@/utils/errors/AppError';
import { IUserService } from '@/services/user.service';
import { TYPES } from '@/types';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, adminAuth } from '@/config/firebase';
import { FirebaseAuthError } from '@/utils/errors/handleFirebaseError';

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

      const user = await this.userService.getUserByFirebaseId(userCredentials.user.uid);

      return {
        accessToken: idToken,
        refreshToken: refreshToken,
      };
    } catch (error) {
      throw new FirebaseAuthError(error);
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

      return {
        accessToken: token,
      };
    } catch (error) {
      throw new FirebaseAuthError(error);
    }
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      const newToken = await adminAuth.createCustomToken(decodedToken.uid);

      return { accessToken: newToken };
    } catch (error) {
      throw new FirebaseAuthError(error);
    }
  }
}
