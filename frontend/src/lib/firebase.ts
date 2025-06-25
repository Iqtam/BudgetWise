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



const firebaseConfig = {
  apiKey: "AIzaSyBjy6keS5hggLEKg56V0cN0DF9B-hzBbzs",
  authDomain: "budget-wise-c6fd9.firebaseapp.com",
  projectId: "budget-wise-c6fd9",
  storageBucket: "budget-wise-c6fd9.firebasestorage.app",
  messagingSenderId: "425952682306",
  appId: "1:425952682306:web:b64b24d380b1318006e8db"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
