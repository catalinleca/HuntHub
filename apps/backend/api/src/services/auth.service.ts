import { inject, injectable } from 'inversify';
import { AuthResponse, LoginCredentials, SignUpCredentials } from '@/types/Auth';
import { IUserService } from '@/services/user.service';
import { TYPES } from '@/types';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, adminAuth } from '@/config/firebase';
import { FirebaseAuthError } from '@/common/errors/FirebaseAuthError';
import { handleWithFirebaseError } from '@/common/errors/handleFirebaseCall';

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

      await this.userService.getUserByFirebaseUid(userCredentials.user.uid);

      //TODO: remove
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

  async signUp(user: SignUpCredentials): Promise<AuthResponse> {
    const { password, ...userData } = user;

    const firebaseUser = await handleWithFirebaseError(() => {
      return createUserWithEmailAndPassword(this.auth, userData.email, password);
    });

    const token = await firebaseUser.user.getIdToken();

    try {
      await this.userService.createUser({
        ...userData,
        firebaseUid: firebaseUser.user.uid,
      } as Required<SignUpCredentials>);

      return { accessToken: token };
    } catch (error) {
      await firebaseUser.user.delete();
      throw error;
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
