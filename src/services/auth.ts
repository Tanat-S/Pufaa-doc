import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import { auth } from './firestore';

const provider = new GoogleAuthProvider();

export { auth };

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthChange: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    onAuthChange(user);
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};
