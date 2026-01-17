import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  browserSessionPersistence,
  setPersistence,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import * as Sentry from '@sentry/react';
import { auth } from '@/services/firebase';
import { FirebaseError } from 'firebase/app';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;

  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPersistence(auth, browserSessionPersistence).catch(console.error);

    return onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
        setError(null);

        if (firebaseUser) {
          Sentry.setUser({ id: firebaseUser.uid });
        } else {
          Sentry.setUser(null);
        }
      },
      (err) => {
        console.error('Auth error: ', err.message);
        setError('Authentication error');
        setLoading(false);
      },
    );
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      const err = error as FirebaseError;

      console.error('Sign in error:', err);

      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in cancelled');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup blocked. Please allow popups.');
      } else {
        setError('Failed to sign in');
      }

      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await firebaseSignOut(auth);
    } catch (err: unknown) {
      console.error('Sign out error:', err);
      setError('Failed to sign out');
      setLoading(false);
      throw err;
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null;

    try {
      return await user.getIdToken(false);
    } catch (err) {
      console.error('Failed to get token:', err);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
