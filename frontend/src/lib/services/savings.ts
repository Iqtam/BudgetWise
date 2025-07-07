import { auth } from '$lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { PUBLIC_BACKEND_API_URL } from '$env/static/public';

const API_URL = PUBLIC_BACKEND_API_URL || "http://localhost/api";

export interface SavingGoal {
	id: string;
	user_id: string;
	description: string;
	start_amount: number;
	target_amount: number;
	start_date: string;
	end_date: string;
	expired: boolean;
	completed: boolean;
	created_at?: string;
	updated_at?: string;
}

export class SavingService {

	// Helper function to wait for auth to be ready and get Firebase token
	private async getAuthToken(): Promise<string | null> {
		return new Promise((resolve) => {
			const unsubscribe = onAuthStateChanged(auth, async (user) => {
				unsubscribe();
				if (user) {
					try {
						const token = await user.getIdToken(true);
						resolve(token);
					} catch (error) {
						console.error('Error getting token:', error);
						resolve(null);
					}
				} else {
					resolve(null);
				}
			});
		});
	}

	// Helper function for API calls with proper authentication
	private async apiCall(endpoint: string, options: RequestInit = {}) {
		const token = await this.getAuthToken();
		
		if (!token) {
			throw new Error('Authentication required');
		}

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
	}

	async getCurrentUser() {
		try {
			return await this.apiCall('/auth/me');
		} catch (error) {
			console.error('Get user error:', error);
			throw error;
		}
	}

	async getAllSavings(): Promise<SavingGoal[]> {
		try {
			// First get the current user to get their UUID
			const user = await this.getCurrentUser();
			
			if (!user?.id) {
				throw new Error('User ID not found');
			}

			// Then fetch savings using the user's UUID
			return await this.apiCall(`/savings?user_id=${user.id}`);
		} catch (error) {
			console.error('Error fetching savings:', error);
			throw error;
		}
	}

	async createSaving(savingData: Omit<SavingGoal, 'id' | 'user_id' | 'expired' | 'completed' | 'created_at' | 'updated_at'>): Promise<any> {
		try {
			// Get current user to get their UUID
			const user = await this.getCurrentUser();
			
			if (!user?.id) {
				throw new Error('User ID not found');
			}

			return await this.apiCall('/savings', {
				method: 'POST',
				body: JSON.stringify({
					...savingData,
					user_id: user.id
				}),
			});
		} catch (error) {
			console.error('Error creating saving:', error);
			throw error;
		}
	}

	async updateSaving(savingId: string, savingData: Partial<Omit<SavingGoal, 'id' | 'user_id'>>): Promise<any> {
		try {
			return await this.apiCall(`/savings/${savingId}`, {
				method: 'PUT',
				body: JSON.stringify(savingData),
			});
		} catch (error) {
			console.error('Error updating saving:', error);
			throw error;
		}
	}

	async deleteSaving(savingId: string): Promise<void> {
		try {
			await this.apiCall(`/savings/${savingId}`, {
				method: 'DELETE',
			});
		} catch (error) {
			console.error('Error deleting saving:', error);
			throw error;
		}
	}
}

export const savingService = new SavingService(); 