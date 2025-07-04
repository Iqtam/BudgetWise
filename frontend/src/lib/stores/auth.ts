import { writable } from 'svelte/store';
import type { User } from 'firebase/auth';

export interface BackendUser {
    id: string;
    email: string;
    role: string;
    permissions?: string[];
    status: string;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
    UserProfile?: {
        full_name: string;
        profile_picture_url: string;
    };
}

export const firebaseUser = writable<User | null>(null);
export const backendUser = writable<BackendUser | null>(null);
export const loading = writable(true);
export const isLoggingOut = writable(false);
