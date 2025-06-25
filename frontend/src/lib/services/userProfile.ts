import { PUBLIC_BACKEND_API_URL } from '$env/static/public';
import { auth } from '$lib/firebase';

const API_URL = PUBLIC_BACKEND_API_URL || "http://localhost/api";

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

export interface UserProfileData {
    full_name?: string;
    profile_picture_url?: string;
}

export interface UpdatePasswordData {
    currentPassword: string;
    newPassword: string;
}

export const userProfileService = {
    // Get current user profile
    async getUserProfile(): Promise<any> {
        return await apiCall('/auth/me');
    },

    // Update user profile
    async updateProfile(profileData: UserProfileData): Promise<any> {
        return await apiCall('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    },

    // Update password
    async updatePassword(passwordData: UpdatePasswordData): Promise<any> {
        return await apiCall('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData),
        });
    },

    // Upload profile picture
    async uploadProfilePicture(file: File): Promise<any> {
        const formData = new FormData();
        formData.append('profile_picture', file);
        
        const token = await getAuthToken();
        const response = await fetch(`${API_URL}/users/profile/picture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to upload profile picture');
        }

        return response.json();
    }
};
