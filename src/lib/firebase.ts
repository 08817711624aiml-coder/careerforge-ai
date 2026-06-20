import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "excellent-app-5jlsj",
  appId: "1:439378726517:web:f7d88174754cfca936f23c",
  apiKey: "AIzaSyAlL2DRons3cpbPcFFV0mdtnilE464ccts",
  authDomain: "excellent-app-5jlsj.firebaseapp.com",
  storageBucket: "excellent-app-5jlsj.firebasestorage.app",
  messagingSenderId: "439378726517"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const provider = new GoogleAuthProvider();
// No extra high-risk Google Drive scopes to ensure silent, direct login

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Read token from transient memory
export const initAuthListener = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken || '');
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (withDrive: boolean = false): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || '';
    
    if (token) {
      cachedAccessToken = token;
    }
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedToken = (): string | null => {
  return cachedAccessToken;
};

export const updateCachedToken = (token: string) => {
  cachedAccessToken = token;
};

export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
