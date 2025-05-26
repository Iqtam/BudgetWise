import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    type UserCredential
} from 'firebase/auth';
import { auth, googleProvider } from '$lib/firebase';

export const signUp = async (email: string, password: string): Promise<UserCredential> => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = async (email: string, password: string): Promise<UserCredential> => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async (): Promise<UserCredential> => {
    return signInWithPopup(auth, googleProvider);
};

export const signOut = async (): Promise<void> => {
    return firebaseSignOut(auth);
}; 