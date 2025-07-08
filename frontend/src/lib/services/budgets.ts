import { auth } from '$lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { PUBLIC_BACKEND_API_URL } from '$env/static/public';

const API_URL = PUBLIC_BACKEND_API_URL || "http://budgetwis.me/api";

export interface Budget {
	id: string;
	user_id: string;
	category_id?: string;
	start_date: string;
	end_date: string;
	goal_amount: number;
	spent: number; // Actual spending tracked in database
	expired: boolean;
	amount_exceeded: boolean;
	icon_url?: string;
	// Additional fields that might be populated by joins or calculations
	category?: {
		id: string;
		name: string;
		type: string;
	};
}

export class BudgetService {

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

	async getAllBudgets(): Promise<Budget[]> {
		try {
			// The backend now handles user filtering through authentication middleware
			return await this.apiCall('/budgets');
		} catch (error) {
			console.error('Error fetching budgets:', error);
			throw error;
		}
	}

	async createBudget(budgetData: Omit<Budget, 'id' | 'user_id' | 'expired' | 'amount_exceeded' | 'created_at' | 'updated_at'>): Promise<any> {
		try {
			// The backend now handles user association through authentication middleware
			return await this.apiCall('/budgets', {
				method: 'POST',
				body: JSON.stringify(budgetData),
			});
		} catch (error) {
			console.error('Error creating budget:', error);
			throw error;
		}
	}

	async updateBudget(budgetId: string, budgetData: Partial<Omit<Budget, 'id' | 'user_id'>>): Promise<any> {
		try {
			return await this.apiCall(`/budgets/${budgetId}`, {
				method: 'PUT',
				body: JSON.stringify(budgetData),
			});
		} catch (error) {
			console.error('Error updating budget:', error);
			throw error;
		}
	}

	async deleteBudget(budgetId: string): Promise<void> {
		try {
			await this.apiCall(`/budgets/${budgetId}`, {
				method: 'DELETE',
			});
		} catch (error) {
			console.error('Error deleting budget:', error);
			throw error;
		}
	}

	async syncBudgetSpending(): Promise<void> {
		try {
			await this.apiCall('/budgets/sync', {
				method: 'POST',
			});
		} catch (error) {
			console.error('Error syncing budget spending:', error);
			throw error;
		}
	}
}

export const budgetService = new BudgetService();
