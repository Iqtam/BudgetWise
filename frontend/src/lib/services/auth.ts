import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    type UserCredential
} from 'firebase/auth';
import { auth, googleProvider } from '$lib/firebase';
import { isLoggingOut } from '$lib/stores/auth';

import {PUBLIC_BACKEND_API_URL} from '$env/static/public';
  

const API_URL = "http://localhost/api";
// const API_URL="http://localhost:5000/api";
// const API_URL = PUBLIC_BACKEND_API_URL;


// Helper function to get Firebase token
const getAuthToken = async (): Promise<string | null> => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken(true);
  };

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
};

export const signUp = async (email: string, password: string): Promise<any> => {
    try {
        const firebaseResult = await createUserWithEmailAndPassword(auth, email, password);
        await syncWithBackend();
        return firebaseResult.user;
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
};

export const signIn = async (email: string, password: string): Promise<any> => {
    try {
        const firebaseResult = await signInWithEmailAndPassword(auth, email, password);
  await syncWithBackend();
  return firebaseResult.user;
    } catch (error) {
        console.error('Sign in error:', error);
        throw error;
    }
};

export const signInWithGoogle = async (): Promise<any> => {
    try {
        const firebaseResult = await signInWithPopup(auth, googleProvider);
  await syncWithBackend();
  return firebaseResult.user;
    } catch (error) {
        console.error('Google sign in error:', error);
        throw error;
    }
};

export const signOut = async (): Promise<void> => {
    isLoggingOut.set(true);
    try {
        await firebaseSignOut(auth);
    } finally {
        // Reset the flag after a short delay to allow for navigation
        setTimeout(() => {
            isLoggingOut.set(false);
        }, 1000);
    }
};


export const syncWithBackend = async (): Promise<any> => {
    try {
        return await apiCall('/auth/firebase', { method: 'POST' });
    } catch (error) {
        console.error('Sync with backend error:', error);
        throw error;
    }
};
// Get current user profile from backend
export const getCurrentUser = async () => {
    try {
        return await apiCall('/auth/me');
    } catch (error) {
        console.error('Get user error:', error);
        throw error;
    }
};



// Check if user has required role
export const hasRole = (user: any, role: string): boolean => {
    return user?.role === role;
};

// Check if user has required permission
export const hasPermission = (user: any, permission: string): boolean => {
    return user?.permissions?.includes(permission) ?? false;
};
