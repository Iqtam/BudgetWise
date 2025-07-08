import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut as firebaseSignOut,
    type UserCredential
} from 'firebase/auth';
import { auth, googleProvider } from '$lib/firebase';
import { isLoggingOut } from '$lib/stores/auth';
import { browser } from '$app/environment';

import {PUBLIC_BACKEND_API_URL} from '$env/static/public';

// Firebase error interface
interface FirebaseError extends Error {
    code?: string;
}

const API_URL = PUBLIC_BACKEND_API_URL ||  "http://localhost/api";
// const API_URL="http://localhost:5000";
// const API_URL = PUBLIC_BACKEND_API_URL;
// console.log("PUBLIC_BACKEND_API_URL");
// console.log(PUBLIC_BACKEND_API_URL);

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
        // Only attempt Google sign-in in the browser
        if (!browser) {
            throw new Error('Google sign-in is only available in the browser');
        }

        // Check if there's a pending redirect result first
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult) {
            await syncWithBackend();
            return redirectResult.user;
        }

        let firebaseResult: UserCredential;
        
        try {
            // Try popup first (preferred method)
            firebaseResult = await signInWithPopup(auth, googleProvider);
        } catch (popupError: any) {
            console.warn('Popup sign-in failed, trying redirect method:', popupError);
            
            // Check if it's a popup-blocked error or similar
            if (
                popupError.code === 'auth/popup-blocked' || 
                popupError.code === 'auth/popup-closed-by-user' ||
                popupError.code === 'auth/cancelled-popup-request' ||
                popupError.message?.includes('popup')
            ) {
                // Fallback to redirect method
                console.log('Using redirect method as fallback');
                await signInWithRedirect(auth, googleProvider);
                
                // Return a promise that will be resolved after redirect
                return new Promise((resolve, reject) => {
                    // This will be handled by the redirect result check on page load
                    setTimeout(() => {
                        reject(new Error('Redirect initiated. Please wait for page to reload.'));
                    }, 1000);
                });
            } else {
                // Re-throw if it's not a popup-related error
                throw popupError;
            }
        }
        
        await syncWithBackend();
        return firebaseResult.user;
    } catch (error: any) {
        console.error('Google sign in error:', error);
        
        // Provide more user-friendly error messages
        let userMessage = 'Failed to sign in with Google.';
        
        if (error instanceof Error) {
            const firebaseError = error as FirebaseError;
            switch (firebaseError.code) {
                case 'auth/popup-blocked':
                    userMessage = 'Popup was blocked. Please allow popups for this site or try again.';
                    break;
                case 'auth/popup-closed-by-user':
                    userMessage = 'Sign-in was cancelled. Please try again.';
                    break;
                case 'auth/network-request-failed':
                    userMessage = 'Network error. Please check your internet connection.';
                    break;
                case 'auth/too-many-requests':
                    userMessage = 'Too many failed attempts. Please wait a moment and try again.';
                    break;
                case 'auth/user-disabled':
                    userMessage = 'Your account has been disabled. Please contact support.';
                    break;
                case 'auth/operation-not-allowed':
                    userMessage = 'Google sign-in is not enabled. Please contact support.';
                    break;
                default:
                    userMessage = firebaseError.message || userMessage;
            }
        }
        
        throw new Error(userMessage);
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
