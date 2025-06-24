import { auth } from '$lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export interface Transaction {
	id: string;
	user_id: string;
	amount: number;
	date: string;
	description: string;
	category_id?: string;
	type: 'income' | 'expense';
	event_id?: string;
	recurrence?: string;
	confirmed: boolean;
}

export class TransactionService {
	private baseUrl = '/api';

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

		const response = await fetch(`${this.baseUrl}${endpoint}`, {
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

	async getAllTransactions(): Promise<Transaction[]> {
		try {
			// First get the current user to get their UUID
			const user = await this.getCurrentUser();
			
			if (!user?.id) {
				throw new Error('User ID not found');
			}

			// Then fetch transactions using the user's UUID
			return await this.apiCall(`/transactions?user_id=${user.id}&sort_by=date&order=DESC`);
		} catch (error) {
			console.error('Error fetching transactions:', error);
			throw error;
		}
	}

	async createTransaction(transactionData: Omit<Transaction, 'id' | 'user_id' | 'confirmed'>): Promise<Transaction> {
		try {
			// Get current user to get their UUID
			const user = await this.getCurrentUser();
			
			if (!user?.id) {
				throw new Error('User ID not found');
			}

			return await this.apiCall('/transactions', {
				method: 'POST',
				body: JSON.stringify({
					...transactionData,
					user_id: user.id
				}),
			});
		} catch (error) {
			console.error('Error creating transaction:', error);
			throw error;
		}
	}
}

export const transactionService = new TransactionService();
