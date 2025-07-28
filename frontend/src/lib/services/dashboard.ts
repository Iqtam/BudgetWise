import { auth } from '$lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { PUBLIC_BACKEND_API_URL } from '$env/static/public';
import { balanceService } from './balance';
import { transactionService } from './transactions';
import { budgetService } from './budgets';
import { debtService } from './debts';
import { savingService } from './savings';

const API_URL = PUBLIC_BACKEND_API_URL || "http://localhost:5000/api";

export interface DashboardData {
	balance: number;
	balanceChange: number;
	monthlyIncome: number;
	monthlyIncomeChange: number;
	monthlyExpenses: number;
	monthlyExpensesChange: number;
	savingsGoal: {
		percent: number;
		current: number;
		target: number;
	};
	budgets: Array<{
		category: string;
		spent: number;
		budget: number;
		percentage: number;
	}>;
	recentTransactions: Array<{
		id: string;
		description: string;
		amount: number;
		type: 'income' | 'expense';
		date: string;
		category?: string;
	}>;
	debts: Array<{
		id: string;
		description: string;
		amount: number;
		type: string;
	}>;
	savingsSummary: Array<{
		id: string;
		description: string;
		current_amount: number;
		target_amount?: number;
	}>;
}

export class DashboardService {
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

	async getDashboardData(): Promise<DashboardData> {
		try {
			console.log('Fetching dashboard data...');
			
			// Initialize default values
			const defaultData: DashboardData = {
				balance: 0,
				balanceChange: 0,
				monthlyIncome: 0,
				monthlyIncomeChange: 0,
				monthlyExpenses: 0,
				monthlyExpensesChange: 0,
				savingsGoal: {
					percent: 0,
					current: 0,
					target: 0
				},
				budgets: [],
				recentTransactions: [],
				debts: [],
				savingsSummary: []
			};

			// Fetch data sequentially to avoid overwhelming the server
			try {
				const balance = await balanceService.getBalance();
				defaultData.balance = balance.balance || 0;
				console.log('Balance loaded:', defaultData.balance);
			} catch (error) {
				console.error('Error loading balance:', error);
			}

			try {
				const transactions = await transactionService.getAllTransactions();
				console.log('Transactions loaded:', transactions.length);
				
				// Calculate monthly income and expenses
				const currentMonth = new Date().getMonth();
				const currentYear = new Date().getFullYear();
				
				const monthlyTransactions = transactions.filter(t => {
					const transactionDate = new Date(t.date);
					return transactionDate.getMonth() === currentMonth && 
						   transactionDate.getFullYear() === currentYear;
				});

				defaultData.monthlyIncome = monthlyTransactions
					.filter(t => t.type === 'income')
					.reduce((sum, t) => sum + Math.abs(t.amount), 0);

				defaultData.monthlyExpenses = monthlyTransactions
					.filter(t => t.type === 'expense')
					.reduce((sum, t) => sum + Math.abs(t.amount), 0);

				// Get recent transactions (last 5)
				defaultData.recentTransactions = transactions
					.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
					.slice(0, 5);

			} catch (error) {
				console.error('Error loading transactions:', error);
			}

			try {
				const budgets = await budgetService.getAllBudgets();
				console.log('Budgets loaded:', budgets.length);
				
				// Calculate budget status
				defaultData.budgets = budgets.map((budget: any) => {
					const spent = budget.spent || 0;
					const budgetAmount = budget.amount || 0;
					const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
					
					return {
						category: budget.category?.name || 'Unknown',
						spent,
						budget: budgetAmount,
						percentage
					};
				});
			} catch (error) {
				console.error('Error loading budgets:', error);
			}

			try {
				const debts = await debtService.getAllDebts();
				defaultData.debts = debts;
				console.log('Debts loaded:', debts.length);
			} catch (error) {
				console.error('Error loading debts:', error);
			}

			try {
				const savings = await savingService.getAllSavings();
				defaultData.savingsSummary = savings;
				console.log('Savings loaded:', savings.length);
				
				// Calculate savings goal
				const totalSavings = savings.reduce((sum: number, s: any) => sum + s.current_amount, 0);
				const totalSavingsTarget = savings.reduce((sum: number, s: any) => sum + (s.target_amount || 0), 0);
				defaultData.savingsGoal.percent = totalSavingsTarget > 0 ? (totalSavings / totalSavingsTarget) * 100 : 0;
				defaultData.savingsGoal.current = totalSavings;
				defaultData.savingsGoal.target = totalSavingsTarget;
			} catch (error) {
				console.error('Error loading savings:', error);
			}

			console.log('Dashboard data loaded successfully');
			return defaultData;
			
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
			throw error;
		}
	}
}

export const dashboardService = new DashboardService(); 