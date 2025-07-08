import { auth } from '$lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { PUBLIC_BACKEND_API_URL } from '$env/static/public';

const API_URL = PUBLIC_BACKEND_API_URL || "http://localhost/api";

export interface Debt {
	id: string;
	user_id: string;
	description: string;
	type: 'bank' | 'personal';
	start_date: string;
	expiration_date: string;
	interest_rate: number;
	amount: number;
	original_amount?: number;
	taken_from: string;
	is_fully_paid?: boolean;
	fully_paid_date?: string;
	last_payment_date?: string;
	created_at?: string;
	updated_at?: string;
}

export class DebtService {

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

	async getAllDebts(): Promise<Debt[]> {
		try {
			// First get the current user to get their UUID
			const user = await this.getCurrentUser();
			
			if (!user?.id) {
				throw new Error('User ID not found');
			}

			// Then fetch debts using the user's UUID
			return await this.apiCall(`/debts?user_id=${user.id}`);
		} catch (error) {
			console.error('Error fetching debts:', error);
			throw error;
		}
	}

	async createDebt(debtData: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<any> {
		try {
			// Get current user to get their UUID
			const user = await this.getCurrentUser();
			
			if (!user?.id) {
				throw new Error('User ID not found');
			}

			return await this.apiCall('/debts', {
				method: 'POST',
				body: JSON.stringify({
					...debtData,
					user_id: user.id
				}),
			});
		} catch (error) {
			console.error('Error creating debt:', error);
			throw error;
		}
	}

	async updateDebt(debtId: string, debtData: Partial<Omit<Debt, 'id' | 'user_id'>>): Promise<any> {
		try {
			return await this.apiCall(`/debts/${debtId}`, {
				method: 'PUT',
				body: JSON.stringify(debtData),
			});
		} catch (error) {
			console.error('Error updating debt:', error);
			throw error;
		}
	}

	async deleteDebt(debtId: string): Promise<void> {
		try {
			await this.apiCall(`/debts/${debtId}`, {
				method: 'DELETE',
			});
		} catch (error) {
			console.error('Error deleting debt:', error);
			throw error;
		}
	}

	async makePayment(debtId: string, paymentAmount: number): Promise<any> {
		try {
			return await this.apiCall(`/debts/${debtId}/payment`, {
				method: 'POST',
				body: JSON.stringify({ payment_amount: paymentAmount }),
			});
		} catch (error) {
			console.error('Error making debt payment:', error);
			throw error;
		}
	}
}

export const debtService = new DebtService();