import { writable } from 'svelte/store';
import { categoryService, type Category } from '$lib/services/categories';

// Create a writable store for categories
export const categories = writable<Category[]>([]);
export const categoriesLoading = writable<boolean>(false);
export const categoriesError = writable<string | null>(null);

// Category store manager
class CategoryStore {
  // Load all categories
  async loadCategories() {
    categoriesLoading.set(true);
    categoriesError.set(null);
    
    try {
      const data = await categoryService.getCategories();
      categories.set(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      categoriesError.set(error instanceof Error ? error.message : 'Failed to load categories');
    } finally {
      categoriesLoading.set(false);
    }
  }

  // Load categories by type
  async loadCategoriesByType(type: 'income' | 'expense') {
    categoriesLoading.set(true);
    categoriesError.set(null);
    
    try {
      const data = await categoryService.getCategories(type);
      categories.set(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      categoriesError.set(error instanceof Error ? error.message : 'Failed to load categories');
    } finally {
      categoriesLoading.set(false);
    }
  }

  // Add a new category to the store
  async createCategory(categoryData: { name: string; type: 'income' | 'expense'; icon_url?: string; parent_id?: string }) {
    try {
      const newCategory = await categoryService.createCategory(categoryData);
      
      // Add to the store
      categories.update(current => [...current, newCategory]);
      
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Refresh categories (useful when switching between pages)
  async refreshCategories() {
    await this.loadCategories();
  }
}

export const categoryStore = new CategoryStore(); 