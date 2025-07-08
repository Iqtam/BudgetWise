import { auth } from '$lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { PUBLIC_BACKEND_API_URL } from '$env/static/public';

const API_URL = PUBLIC_BACKEND_API_URL || "http://budgetwis.me/api";

export interface Category {
	id: string;
	name: string;
	type: 'income' | 'expense';
	icon_url?: string;
	parent_id?: string;
}

export class CategoryService {

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

	async getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
		try {
			const endpoint = type ? `/categories?type=${type}` : '/categories';
			return await this.apiCall(endpoint);
		} catch (error) {
			console.error('Error fetching categories:', error);
			throw error;
		}
	}

	// Alias for backwards compatibility
	async getAllCategories(): Promise<Category[]> {
		return this.getCategories();
	}

	// Get only expense categories (for budgets)
	async getExpenseCategories(): Promise<Category[]> {
		return this.getCategories('expense');
	}

	// Get only income categories
	async getIncomeCategories(): Promise<Category[]> {
		return this.getCategories('income');
	}

	async createCategory(categoryData: { name: string; type: 'income' | 'expense'; icon_url?: string; parent_id?: string }): Promise<Category> {
		try {
			return await this.apiCall('/categories', {
				method: 'POST',
				body: JSON.stringify(categoryData),
			});
		} catch (error) {
			console.error('Error creating category:', error);
			throw error;
		}
	}

	// Helper method to get category name by ID
	getCategoryName(categoryId: string, categories: Category[]): string {
		const category = categories.find(cat => cat.id === categoryId);
		return category?.name || 'No Category';
	}

	// Helper method to get category ID by name
	getCategoryId(categoryName: string, categories: Category[]): string | null {
		const category = categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
		return category?.id || null;
	}
}

export const categoryService = new CategoryService();
