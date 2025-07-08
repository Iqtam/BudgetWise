import { auth } from '$lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { PUBLIC_BACKEND_API_URL } from '$env/static/public';

const API_URL = PUBLIC_BACKEND_API_URL || "http://localhost/api";

export interface Balance {
	id: string;
	user_id: string;
	balance: string;
}

export class BalanceService {

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

	async getBalance(): Promise<Balance> {
		try {
			return await this.apiCall('/balance');
		} catch (error) {
			console.error('Error fetching balance:', error);
			throw error;
		}
	}

	async updateBalance(balance: number): Promise<any> {
		try {
			return await this.apiCall('/balance', {
				method: 'PUT',
				body: JSON.stringify({ balance }),
			});
		} catch (error) {
			console.error('Error updating balance:', error);
			throw error;
		}
	}

	async adjustBalance(amount: number, type: 'add' | 'subtract'): Promise<any> {
		try {
			return await this.apiCall('/balance/adjust', {
				method: 'POST',
				body: JSON.stringify({ amount, type }),
			});
		} catch (error) {
			console.error('Error adjusting balance:', error);
			throw error;
		}
	}
}

export const balanceService = new BalanceService(); 