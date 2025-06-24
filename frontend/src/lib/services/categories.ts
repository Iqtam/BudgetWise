export interface Category {
	id: string;
	name: string;
	type: 'income' | 'expense';
	icon_url?: string;
	parent_id?: string;
}

export class CategoryService {
	private baseUrl = '/api';

	async getCategories(): Promise<Category[]> {
		try {
			const response = await fetch(`${this.baseUrl}/categories`, {
				credentials: 'include',
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch categories: ${response.statusText}`);
			}

			return response.json();
		} catch (error) {
			console.error('Error fetching categories:', error);
			throw error;
		}
	}

	// Helper method to get category name by ID
	async getCategoryName(categoryId: string, categories?: Category[]): Promise<string> {
		try {
			const allCategories = categories || await this.getCategories();
			const category = allCategories.find(cat => cat.id === categoryId);
			return category?.name || 'Unknown';
		} catch (error) {
			console.error('Error getting category name:', error);
			return 'Unknown';
		}
	}

	// Helper method to get category ID by name
	async getCategoryId(categoryName: string, categories?: Category[]): Promise<string | null> {
		try {
			const allCategories = categories || await this.getCategories();
			const category = allCategories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
			return category?.id || null;
		} catch (error) {
			console.error('Error getting category ID:', error);
			return null;
		}
	}
}

export const categoryService = new CategoryService();
