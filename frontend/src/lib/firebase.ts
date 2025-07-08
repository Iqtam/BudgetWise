import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  PUBLIC_FIREBASE_API_KEY,
  PUBLIC_FIREBASE_AUTH_DOMAIN,
  PUBLIC_FIREBASE_PROJECT_ID,
  PUBLIC_FIREBASE_STORAGE_BUCKET,
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  PUBLIC_FIREBASE_APP_ID
} from '$env/static/public';

// Use environment variables with fallback to hardcoded values for backward compatibility
const firebaseConfig = {
  apiKey: PUBLIC_FIREBASE_API_KEY || "AIzaSyBjy6keS5hggLEKg56V0cN0DF9B-hzBbzs",
  authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN || "budget-wise-c6fd9.firebaseapp.com",
  projectId: PUBLIC_FIREBASE_PROJECT_ID || "budget-wise-c6fd9",
  storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET || "budget-wise-c6fd9.firebasestorage.app",
  messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "425952682306",
  appId: PUBLIC_FIREBASE_APP_ID || "1:425952682306:web:b64b24d380b1318006e8db"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Configure Google provider with proper settings
export const googleProvider = new GoogleAuthProvider();

// Add required scopes for better user information
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Add custom parameters to improve the sign-in experience
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Include hint for better UX
});

// Set language for better localization (optional)
auth.languageCode = 'en';
