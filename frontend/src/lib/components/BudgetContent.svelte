<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Progress } from '$lib/components/ui/progress';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import Icon from '@iconify/svelte';
	import { budgetService, type Budget } from '$lib/services/budgets';
	import { categoryService, type Category } from '$lib/services/categories';
	import { firebaseUser, loading as authLoading } from '$lib/stores/auth';
	import { onMount } from 'svelte'; // State variables
	let budgets = $state<Budget[]>([]);
	let categories = $state<Category[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let successMessage = $state<string | null>(null);
	let isBudgetDialogOpen = $state(false);
	let isDetailsOpen = $state(false);
	let selectedBudgetDetails = $state<Budget | null>(null);
	let currentPage = $state(1);
	let itemsPerPage = 10;
	let isSaving = $state(false);
	let isNewCategoryOpen = $state(false);
	let newCategoryName = $state('');
	let categoryNameError = $state(false);
	let isEditDialogOpen = $state(false);
	let editingBudget = $state<Budget | null>(null);
	let isDeleting = $state(false);

	// Separate error states for dialogs
	let createBudgetError = $state<string | null>(null);
	let editBudgetError = $state<string | null>(null);
	let newCategoryError = $state<string | null>(null);

	// Form fields
	let formCategory = $state('');
	let formBudgetAmount = $state('');
	let formStartDate = $state(new Date().toISOString().split('T')[0]);
	let formEndDate = $state('');

	// Edit form fields
	let editFormCategory = $state('');
	let editFormBudgetAmount = $state('');
	let editFormStartDate = $state('');
	let editFormEndDate = $state('');

	// Wait for authentication before loading data
	$effect(() => {
		if (!$authLoading && $firebaseUser) {
			loadData();
		}
	});
	// Function to load budgets and categories from API
	async function loadData() {
		isLoading = true;
		error = null;
				try {
			// First sync budget spending to ensure we have up-to-date data
			await budgetService.syncBudgetSpending();

			const [budgetData, categoryData] = await Promise.all([
				budgetService.getAllBudgets(),
				categoryService.getExpenseCategories() // Only get expense categories for budgets
			]);
			
			budgets = budgetData;
			categories = categoryData;
		} catch (err) {
			console.error('Error loading data:', err);
			error = err instanceof Error ? err.message : 'Failed to load data';
		} finally {
			isLoading = false;
		}
	} // Reset current page when budgets change
	$effect(() => {
		currentPage = 1;
	}); // Computed values for budget summary
	let totalBudget = $derived(
		budgets.reduce((sum, budget) => sum + parseFloat(String(budget.goal_amount || '0')), 0)
	);
	let totalSpent = $derived(budgets.reduce((sum, budget) => sum + getSpentAmount(budget), 0));
	let overallProgress = $derived(totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0);
	let budgetsNearLimit = $derived(
		budgets.filter(
			(b) => (getSpentAmount(b) / parseFloat(String(b.goal_amount || '0'))) * 100 >= 80
		).length
	);
	let totalRemaining = $derived(totalBudget - totalSpent); // Helper function to get category name by ID
	function getCategoryName(categoryId: string | undefined) {
		if (!categoryId) return 'No Category';
		const category = categories.find((c) => c.id === categoryId);
		return category ? category.name : 'Unknown Category';
	} // Helper function to get actual spent amount from budget data
	function getSpentAmount(budget: Budget): number {
		// Use the actual spent field from the database if available
		if (budget.spent !== null && budget.spent !== undefined) {
			return parseFloat(String(budget.spent));
		}

		// Fallback to 0 if no spent data is available
		return 0;
	}
	async function handleAddCategory(event: Event) {
		event.preventDefault();
		
		if (!newCategoryName.trim()) {
			// Show visual indication instead of blocking message
			categoryNameError = true;
			setTimeout(() => {
				categoryNameError = false;
			}, 2000);
			return;
		}

		try {
			const newCategory = await categoryService.createCategory({
				name: newCategoryName.trim(),
				type: 'expense' // Default to expense for budget categories
			});

			// Add the new category to our local categories list
			categories = [...categories, newCategory];
			
			// Select the new category in the form
			formCategory = newCategory.id;
			
			// Reset form and close dialog
			newCategoryName = '';
			categoryNameError = false;
			isNewCategoryOpen = false;
			
			successMessage = 'Category created successfully';
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error creating category:', err);
			error = err instanceof Error ? err.message : 'Failed to create category';
		}
	}

	function getPaginatedBudgets() {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		const paginatedBudgets = budgets.slice(startIndex, endIndex);

		return {
			budgets: paginatedBudgets,
			totalCount: budgets.length,
			totalPages: Math.ceil(budgets.length / itemsPerPage),
			startIndex: startIndex + 1,
			endIndex: Math.min(endIndex, budgets.length)
		};
	}
	let paginatedData = $derived(getPaginatedBudgets());

	async function handleCreateBudget(event: Event) {
		event.preventDefault();
		
		if (!formBudgetAmount || !formStartDate || !formEndDate) {
			error = 'Please fill in all required fields';
			return;
		}

		// Validate start date vs end date
		const startDate = new Date(formStartDate);
		const endDate = new Date(formEndDate);

		if (endDate <= startDate) {
			createBudgetError = 'End date must be after the start date';
			return;
		}

		// Validate budget amount is positive
		if (parseFloat(formBudgetAmount) <= 0) {
			createBudgetError = 'Budget amount must be greater than 0';
			return;
		}

		isSaving = true;
		createBudgetError = null;
		try {
			await budgetService.createBudget({
				category_id: formCategory || undefined,
				start_date: formStartDate,
				end_date: formEndDate,
				goal_amount: parseFloat(formBudgetAmount),
				spent: 0
			});

			// Sync budget spending and reload data to get the new budget with current spending
			await budgetService.syncBudgetSpending();
			await loadData();
			
			isBudgetDialogOpen = false;
			
			// Reset form
			formCategory = '';
			formBudgetAmount = '';
			formStartDate = new Date().toISOString().split('T')[0];
			formEndDate = '';

			// Show success message
			successMessage = 'Budget created successfully';

			// Auto-hide success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error creating budget:', err);
			createBudgetError = err instanceof Error ? err.message : 'Failed to create budget';
		} finally {
			isSaving = false;
		}
	}
	function handleViewDetails(budget: Budget) {
		selectedBudgetDetails = budget;
		isDetailsOpen = true;
	}

	function handleEditBudget(budget: Budget) {
		editingBudget = budget;
		editFormCategory = budget.category_id || '';
		editFormBudgetAmount = budget.goal_amount.toString();
		editFormStartDate = budget.start_date;
		editFormEndDate = budget.end_date;
		isEditDialogOpen = true;
	}

	async function handleUpdateBudget(event: Event) {
		event.preventDefault();
		
		if (!editingBudget || !editFormBudgetAmount || !editFormStartDate || !editFormEndDate) {
			error = 'Please fill in all required fields';
			return;
		}

		// Validate start date vs end date
		const startDate = new Date(editFormStartDate);
		const endDate = new Date(editFormEndDate);

		if (endDate <= startDate) {
			editBudgetError = 'End date must be after the start date';
			return;
		}

		// Validate budget amount is positive
		if (parseFloat(editFormBudgetAmount) <= 0) {
			editBudgetError = 'Budget amount must be greater than 0';
			return;
		}

		isSaving = true;
		editBudgetError = null;
		try {
			await budgetService.updateBudget(editingBudget.id, {
				category_id: editFormCategory || undefined,
				start_date: editFormStartDate,
				end_date: editFormEndDate,
				goal_amount: parseFloat(editFormBudgetAmount)
			});

			// Sync budget spending and reload data to get the updated budget with current spending
			await budgetService.syncBudgetSpending();
			await loadData();
			
			isEditDialogOpen = false;
			editingBudget = null;
			
			// Show success message
			successMessage = 'Budget updated successfully';

			// Auto-hide success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error updating budget:', err);
			editBudgetError = err instanceof Error ? err.message : 'Failed to update budget';
		} finally {
			isSaving = false;
		}
	}

	async function handleDeleteBudget(budget: Budget) {
		if (
			!confirm(
				`Are you sure you want to delete the budget for "${getCategoryName(budget.category_id)}"?`
			)
		) {
			return;
		}

		isDeleting = true;
		error = null;
		try {
			await budgetService.deleteBudget(budget.id);
			
			// Reload data to remove the deleted budget
			await loadData();
			
			// Show success message
			successMessage = 'Budget deleted successfully';

			// Auto-hide success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error deleting budget:', err);
			error = err instanceof Error ? err.message : 'Failed to delete budget';
		} finally {
			isDeleting = false;
		}
	}

	async function handleSyncBudgets() {
		isSaving = true;
		error = null;
		try {
			await budgetService.syncBudgetSpending();

			// Reload data to get updated spending amounts
			await loadData();

			// Show success message
			successMessage = 'Budget data refreshed successfully';

			// Auto-hide success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error syncing budgets:', err);
			error = err instanceof Error ? err.message : 'Failed to sync budget spending';
		} finally {
			isSaving = false;
		}
	}
	function getBudgetStatus(spent: number, budgetAmount: number) {
		if (budgetAmount <= 0)
			return { status: 'No Budget', color: 'text-gray-400', bgColor: 'bg-gray-500/20' };
		const percentage = (spent / budgetAmount) * 100;
		if (percentage >= 100)
			return { status: 'Over Budget', color: 'text-red-400', bgColor: 'bg-red-500/20' };
		if (percentage >= 80)
			return { status: 'Near Limit', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
		return { status: 'On Track', color: 'text-green-400', bgColor: 'bg-green-500/20' };
	}

	// Calculate overspending forecast for a budget
	function calculateOverspendingForecast(budget: Budget) {
		const now = new Date();
		const startDate = new Date(budget.start_date);
		const endDate = new Date(budget.end_date);
		const goalAmount = parseFloat(String(budget.goal_amount || '0'));
		const spentAmount = getSpentAmount(budget);

		// Only forecast for active budgets
		if (now < startDate || now > endDate || goalAmount <= 0) {
			return null;
		}

		// Calculate days passed and total days in budget period
		const daysPassed = Math.max(
			1,
			Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
		);
		const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

		// Calculate daily spend rate
		const dailySpendRate = spentAmount / daysPassed;

		// Project full period spend
		const projectedSpend = dailySpendRate * totalDays;

		// Calculate overspend percentage
		const overspendPercentage = ((projectedSpend - goalAmount) / goalAmount) * 100;

		return {
			budget,
			projectedSpend,
			overspendPercentage,
			dailySpendRate,
			daysPassed,
			totalDays,
			daysRemaining: totalDays - daysPassed
		};
	}

	// Get budget insights for the 3-box layout
	function getBudgetInsights() {
		if (budgets.length === 0) return { alert: null, progress: null, tip: null };

		const alerts = [];
		const progressItems = [];
		const tips = [];

		// Check for overspending forecasts and over-budget situations
		for (const budget of budgets) {
			const forecast = calculateOverspendingForecast(budget);
			if (forecast && forecast.overspendPercentage > 0) {
				alerts.push({
					type: 'overspending_forecast',
					severity: forecast.overspendPercentage,
					budget: forecast.budget,
					forecast: forecast
				});
			}

			const spent = getSpentAmount(budget);
			const goalAmount = parseFloat(String(budget.goal_amount || '0'));
			const percentage = goalAmount > 0 ? (spent / goalAmount) * 100 : 0;

			if (percentage >= 100) {
				alerts.push({
					type: 'over_budget',
					severity: percentage,
					budget: budget,
					overAmount: spent - goalAmount
				});
			} else if (percentage >= 80) {
				alerts.push({
					type: 'near_limit',
					severity: percentage,
					budget: budget,
					percentage: percentage
				});
			}
		}

		// Check for good progress items (time-aware)
		for (const budget of budgets) {
			const spent = getSpentAmount(budget);
			const goalAmount = parseFloat(String(budget.goal_amount || '0'));
			const spentPercentage = goalAmount > 0 ? (spent / goalAmount) * 100 : 0;

			const now = new Date();
			const startDate = new Date(budget.start_date);
			const endDate = new Date(budget.end_date);
			const hasTimeRemaining = now < endDate;

			if (goalAmount > 0 && hasTimeRemaining && now >= startDate) {
				// Calculate time elapsed percentage
				const totalDays = Math.ceil(
					(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
				);
				const daysPassed = Math.max(
					1,
					Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
				);
				const timeElapsedPercentage = (daysPassed / totalDays) * 100;

				// Good progress: spending percentage is significantly lower than time elapsed percentage
				// For example: 30% spent but 50% of time passed = good progress
				const progressMargin = timeElapsedPercentage - spentPercentage;

				if (progressMargin > 10) {
					// At least 10% better than expected pace
					progressItems.push({
						type: 'good_progress',
						budget: budget,
						spentPercentage: spentPercentage,
						timeElapsedPercentage: timeElapsedPercentage,
						progressMargin: progressMargin
					});
				}
			}
		}

		// Generate optimization tips
		const underutilizedBudgets = budgets.filter((budget) => {
			const spent = getSpentAmount(budget);
			const goalAmount = parseFloat(String(budget.goal_amount || '0'));
			const percentage = goalAmount > 0 ? (spent / goalAmount) * 100 : 0;
			return percentage < 30 && goalAmount > 0;
		});

		const overutilizedBudgets = budgets.filter((budget) => {
			const spent = getSpentAmount(budget);
			const goalAmount = parseFloat(String(budget.goal_amount || '0'));
			const percentage = goalAmount > 0 ? (spent / goalAmount) * 100 : 0;
			return percentage > 80;
		});

		if (underutilizedBudgets.length > 0 && overutilizedBudgets.length > 0) {
			tips.push({
				type: 'reallocation',
				underutilized: underutilizedBudgets[0],
				overutilized: overutilizedBudgets[0]
			});
		} else if (budgets.length > 0) {
			// General tip about budget monitoring
			tips.push({
				type: 'monitoring',
				budgetCount: budgets.length
			});
		}

		// Sort and pick the most significant for each category
		alerts.sort((a, b) => b.severity - a.severity);
		progressItems.sort((a, b) => b.progressMargin - a.progressMargin); // Higher margin = better progress

		return {
			alert: alerts.length > 0 ? alerts[0] : null,
			progress: progressItems.length > 0 ? progressItems[0] : null,
			tip: tips.length > 0 ? tips[0] : null
		};
	}

	// Get the budget insights as a derived value
	let budgetInsights = $derived(getBudgetInsights());
</script>

<div class="flex-1 space-y-6 bg-gray-950 p-6">
	<!-- Error and Success Messages -->
	{#if error}
		<div class="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
			<p class="text-sm text-red-400">{error}</p>
		</div>
	{/if}

	{#if successMessage}
		<div class="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
			<p class="text-sm text-green-400">{successMessage}</p>
		</div>
	{/if}

	<!-- Loading State -->
	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<div class="text-gray-400">Loading budgets...</div>
		</div>
	{:else}
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold text-white">Budget Management</h2>
			<p class="text-gray-400">Track and manage your spending budgets</p>
		</div>
			<div class="flex items-center gap-3">
				<!-- Manual Refresh Button (spending syncs automatically) -->
				<Button
					variant="outline"
					onclick={handleSyncBudgets}
					disabled={isSaving}
					class="border-gray-600 bg-gray-800 text-xs text-gray-300 hover:bg-gray-700"
					title="Manually refresh spending data (spending syncs automatically)"
				>
					{isSaving ? 'Refreshing...' : 'Refresh'}
				</Button>
		<Dialog bind:open={isBudgetDialogOpen}>
			<DialogTrigger>
						<Button
							class="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
						>
							<Icon icon="lucide:plus" class="mr-2 h-4 w-4" />
					Create Budget
				</Button>
			</DialogTrigger>
					<DialogContent class="border-gray-700 bg-gray-800 text-white sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create New Budget</DialogTitle>
					<DialogDescription class="text-gray-400">
						Set up a new spending budget for a category
					</DialogDescription>
				</DialogHeader>

						<!-- Error Message for Create Budget Dialog -->
						{#if createBudgetError}
							<div class="mb-4 rounded-lg border border-red-500 bg-red-900/50 p-3">
								<p class="text-sm text-red-300">{createBudgetError}</p>
							</div>
						{/if}

						<form onsubmit={handleCreateBudget} class="space-y-4">
							<div class="space-y-2">
						<Label for="category">Category (Optional)</Label>
						<div class="flex gap-2">
									<select
										bind:value={formCategory}
										class="flex-1 rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
									>
								<option value="">Select category (optional)</option>
								{#each categories as category}
									<option value={category.id}>
										{category.name}
									</option>
								{/each}
							</select>
							<Dialog bind:open={isNewCategoryOpen}>
								<DialogTrigger>
									<Button
										type="button"
										variant="outline"
										size="sm"
												class="border-gray-600 bg-gray-800 px-3 text-gray-300 hover:bg-gray-700"
									>
												<Icon icon="lucide:plus" class="h-4 w-4" />
									</Button>
								</DialogTrigger>
										<DialogContent class="border-gray-700 bg-gray-800 text-white sm:max-w-[300px]">
									<DialogHeader>
										<DialogTitle>Add New Category</DialogTitle>
												<DialogDescription class="text-gray-400"
													>Create a new budget category</DialogDescription
												>
											</DialogHeader>
											<form onsubmit={handleAddCategory} novalidate class="space-y-4">
												<div class="relative space-y-2">
													<Label for="newCategory">Category Name</Label>
													<div class="group relative">
												<Input
													id="newCategory"
													bind:value={newCategoryName}
													placeholder="Enter category name"
															oninput={() => (categoryNameError = false)}
															class="bg-gray-700 {categoryNameError
																? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
																: 'border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}"
												/>
												<!-- Error message only shows on hover -->
														<div
															class="pointer-events-none absolute left-0 top-full z-10 mt-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
														>
															<div
																class="whitespace-nowrap rounded bg-red-500 px-2 py-1 text-xs text-white shadow-lg"
															>
														{#if categoryNameError}
															Category name is required
														{:else}
															Please fill out this field
														{/if}
													</div>
												</div>
											</div>
												</div>
												<div class="flex gap-2">
													<Button
												type="button"
												variant="outline"
												onclick={() => {
													isNewCategoryOpen = false;
													categoryNameError = false;
															newCategoryName = '';
												}}
														class="flex-1 border-black bg-black font-bold text-red-500 hover:bg-gray-900"
											>
												Cancel
											</Button>
											<Button
												type="submit"
														class="flex-1 bg-gradient-to-r from-blue-500 to-green-500 font-bold text-white hover:from-blue-600 hover:to-green-600"
											>
												Add
											</Button>
										</div>
									</form>
								</DialogContent>
							</Dialog>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="budgetAmount">Budget Amount</Label>
						<Input
							id="budgetAmount"
							bind:value={formBudgetAmount}
							type="number"
							step="0.01"
							placeholder="0.00"
							required
									class="border-gray-600 bg-gray-700"
						/>
					</div>

					<div class="space-y-2">
						<Label for="startDate">Start Date</Label>
						<Input
							id="startDate"
							bind:value={formStartDate}
							type="date"
							required
									class="border-gray-600 bg-gray-700"
						/>
					</div>

					<div class="space-y-2">
						<Label for="endDate">End Date</Label>
						<Input 
							id="endDate" 
							bind:value={formEndDate} 
							type="date" 
							required 
									class="border-gray-600 bg-gray-700"
						/>
							</div>
							<Button
						type="submit"
						disabled={isSaving}
						class="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
					>
						{isSaving ? 'Creating...' : 'Create Budget'}
					</Button>
				</form>
					</DialogContent>
				</Dialog>
			</div>
	</div>

	<!-- Edit Budget Dialog -->
	<Dialog bind:open={isEditDialogOpen}>
			<DialogContent class="border-gray-700 bg-gray-800 text-white sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>Edit Budget</DialogTitle>
					<DialogDescription class="text-gray-400">Update your budget settings</DialogDescription>
			</DialogHeader>

				<!-- Error Message for Edit Budget Dialog -->
				{#if editBudgetError}
					<div class="mb-4 rounded-lg border border-red-500 bg-red-900/50 p-3">
						<p class="text-sm text-red-300">{editBudgetError}</p>
					</div>
				{/if}

			<form onsubmit={handleUpdateBudget} class="space-y-4">
				<div class="space-y-2">
					<Label for="editCategory">Category (Optional)</Label>
					<div class="flex gap-2">
							<select
								bind:value={editFormCategory}
								class="flex-1 rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
							>
							<option value="">Select category (optional)</option>
							{#each categories as category}
								<option value={category.id}>
									{category.name}
								</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="editBudgetAmount">Budget Amount</Label>
					<Input
						id="editBudgetAmount"
						bind:value={editFormBudgetAmount}
						type="number"
						step="0.01"
						placeholder="0.00"
						required
							class="border-gray-600 bg-gray-700"
					/>
				</div>

				<div class="space-y-2">
					<Label for="editStartDate">Start Date</Label>
					<Input
						id="editStartDate"
						bind:value={editFormStartDate}
						type="date"
						required
							class="border-gray-600 bg-gray-700"
					/>
				</div>

				<div class="space-y-2">
					<Label for="editEndDate">End Date</Label>
					<Input 
						id="editEndDate" 
						bind:value={editFormEndDate} 
						type="date" 
						required 
							class="border-gray-600 bg-gray-700"
					/>
				</div>

				<div class="flex gap-2">
					<Button
						type="button"
						variant="outline"
							onclick={() => (isEditDialogOpen = false)}
						class="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isSaving}
						class="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
					>
						{isSaving ? 'Updating...' : 'Update Budget'}
					</Button>
				</div>
			</form>
		</DialogContent>
	</Dialog>

	<!-- Budget Overview -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card class="border-gray-800 bg-gray-900">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Total Budget</CardTitle>
					<Icon icon="lucide:dollar-sign" class="h-4 w-4 text-gray-400" />
				</CardHeader>
				<CardContent>
				<div class="text-2xl font-bold text-white">
					{#if isNaN(totalBudget) || totalBudget <= 0}
						$0
					{:else}
						${totalBudget.toLocaleString()}
					{/if}
				</div>
				<p class="text-xs text-gray-400">{budgets.length} active budgets</p>
			</CardContent>
		</Card>

			<Card class="border-gray-800 bg-gray-900">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Total Spent</CardTitle>
					<Icon icon="lucide:trending-up" class="h-4 w-4 text-gray-400" />
				</CardHeader>
				<CardContent>
				<div class="text-2xl font-bold text-red-400">
					{#if isNaN(totalSpent) || totalSpent <= 0}
						$0
					{:else}
						${totalSpent.toLocaleString()}
					{/if}
				</div>
				<p class="text-xs text-gray-400">
						{totalBudget > 0 && !isNaN(overallProgress)
							? `${overallProgress.toFixed(1)}% of total budget`
							: '0.0% of total budget'}
				</p>
			</CardContent>
		</Card>

			<Card class="border-gray-800 bg-gray-900">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Remaining</CardTitle>
					<Icon icon="lucide:pie-chart" class="h-4 w-4 text-gray-400" />
				</CardHeader>
				<CardContent>
				<div class="text-2xl font-bold {totalRemaining >= 0 ? 'text-green-400' : 'text-red-400'}">
					{#if isNaN(totalRemaining)}
						$0
					{:else if totalRemaining >= 0}
						${totalRemaining.toLocaleString()}
					{:else}
						-${Math.abs(totalRemaining).toLocaleString()}
					{/if}
				</div>
				<p class="text-xs text-gray-400">
					{totalRemaining >= 0 ? 'Available to spend' : 'Over budget'}
				</p>
			</CardContent>
		</Card>

			<Card class="border-gray-800 bg-gray-900">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Alerts</CardTitle>
					<Icon icon="lucide:alert-triangle" class="h-4 w-4 text-gray-400" />
				</CardHeader>
				<CardContent>
				<div class="text-2xl font-bold text-yellow-400">
					{budgetsNearLimit}
				</div>
				<p class="text-xs text-gray-400">Budgets near limit</p>
			</CardContent>
		</Card>
	</div>

	<!-- Budget Categories -->
		<Card class="border-gray-800 bg-gray-900">
		<CardHeader>
			<CardTitle class="text-white">Budget Categories</CardTitle>
				<CardDescription class="flex items-center justify-between text-gray-400">
				<span>
						Showing {paginatedData.startIndex}-{paginatedData.endIndex} of {paginatedData.totalCount}
						budgets
				</span>
				<span class="text-sm">
					Page {currentPage} of {paginatedData.totalPages}
				</span>
			</CardDescription>
		</CardHeader>
			<CardContent>
				<div class="space-y-6">
					{#each paginatedData.budgets as budget}
					{@const spentAmount = getSpentAmount(budget)}
					{@const goalAmount = parseFloat(String(budget.goal_amount || '0'))}
					{@const percentage = goalAmount > 0 ? (spentAmount / goalAmount) * 100 : 0}
					{@const remaining = goalAmount - spentAmount}
					{@const budgetStatus = getBudgetStatus(spentAmount, goalAmount)}
						<div class="space-y-4 rounded-lg border border-gray-800 p-4">
						<div class="flex items-center justify-between">
							<div>
								<div class="flex items-center gap-2">
									<h3 class="font-semibold text-white">{getCategoryName(budget.category_id)}</h3>
									<Badge class="{budgetStatus.bgColor} {budgetStatus.color} border-0">
										{budgetStatus.status}
									</Badge>
									</div>
									<p class="text-sm text-gray-400">
										{new Date(budget.start_date).toLocaleDateString()} to {new Date(
											budget.end_date
										).toLocaleDateString()}
									</p>
								</div>
								<div class="text-right">
								<p class="text-lg font-bold text-white">${spentAmount.toLocaleString()}</p>
									<p class="text-sm text-gray-400">of ${goalAmount.toLocaleString()}</p>
									<div class="mt-2 flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onclick={() => handleViewDetails(budget)}
											class="flex-1 border-2 border-blue-500 bg-gray-900 font-semibold text-blue-400 shadow-lg hover:bg-blue-500/20 hover:text-blue-300"
									>
										View Details
									</Button>
									<Button 
										variant="outline" 
										size="sm" 
										onclick={() => handleEditBudget(budget)}
											class="flex-1 border-2 border-green-500 bg-gray-900 font-semibold text-green-400 shadow-lg hover:bg-green-500/20 hover:text-green-300"
									>
											<Icon icon="lucide:edit-3" class="mr-1 h-4 w-4" />
										Edit
									</Button>
									<Button 
										variant="outline" 
										size="sm" 
										onclick={() => handleDeleteBudget(budget)}
										disabled={isDeleting}
											class="flex-1 border-2 border-red-500 bg-gray-900 font-semibold text-red-400 shadow-lg hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
									>
											<Icon icon="lucide:trash-2" class="mr-1 h-4 w-4" />
										{isDeleting ? 'Deleting...' : 'Delete'}
									</Button>
								</div>
							</div>
						</div>

						<div class="space-y-2">
							<div class="flex justify-between text-sm">
								<span class="text-gray-300">Progress</span>
								<span class="text-gray-300">{percentage.toFixed(1)}% used</span>
							</div>
							<Progress value={Math.min(percentage, 100)} class="h-2" />
							<p class="text-xs text-gray-400">
								{remaining > 0
									? `$${remaining.toLocaleString()} remaining`
									: `$${Math.abs(remaining).toLocaleString()} over budget`}
								</p>
							</div>
					</div>
				{/each}
			</div>

			{#if paginatedData.totalPages > 1}
					<div class="flex items-center justify-between border-t border-gray-800 pt-4">
					<div class="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
								onclick={() => (currentPage = Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}
							class="border-gray-600 text-gray-300 hover:bg-gray-700"
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
								onclick={() => (currentPage = Math.min(paginatedData.totalPages, currentPage + 1))}
							disabled={currentPage === paginatedData.totalPages}
							class="border-gray-600 text-gray-300 hover:bg-gray-700"
						>
							Next
						</Button>
					</div>
					<div class="flex items-center gap-1">
						{#each Array.from({ length: Math.min(5, paginatedData.totalPages) }, (_, i) => i + 1) as pageNum}
							{@const isActive = pageNum === currentPage}
							<Button
									variant={isActive ? 'default' : 'outline'}
								size="sm"
									onclick={() => (currentPage = pageNum)}
								class={isActive
										? 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600'
										: 'border-gray-600 text-gray-300 hover:bg-gray-700'}
							>
								{pageNum}
							</Button>
						{/each}
						{#if paginatedData.totalPages > 5}
								<span class="px-2 text-gray-400">...</span>
							<Button
									variant={currentPage === paginatedData.totalPages ? 'default' : 'outline'}
								size="sm"
									onclick={() => (currentPage = paginatedData.totalPages)}
								class={currentPage === paginatedData.totalPages
										? 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600'
										: 'border-gray-600 text-gray-300 hover:bg-gray-700'}
							>
								{paginatedData.totalPages}
							</Button>
						{/if}
					</div>
					<div class="text-sm text-gray-400">
						Showing {paginatedData.startIndex}-{paginatedData.endIndex} of {paginatedData.totalCount}
					</div>
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Budget Details Dialog -->
	<Dialog bind:open={isDetailsOpen}>
			<DialogContent class="border-gray-700 bg-gray-800 text-white sm:max-w-[500px]">
			<DialogHeader>
				<DialogTitle class="flex items-center gap-2">
						<Icon icon="lucide:pie-chart" class="h-5 w-5 text-blue-400" />
					Budget Details
				</DialogTitle>
					<DialogDescription class="text-gray-400"
						>Complete information about this budget</DialogDescription
					>
				</DialogHeader>
				{#if selectedBudgetDetails}
				{@const spentAmount = getSpentAmount(selectedBudgetDetails)}
				{@const detailGoalAmount = parseFloat(String(selectedBudgetDetails.goal_amount || '0'))}
					{@const detailPercentage =
						detailGoalAmount > 0 ? (spentAmount / detailGoalAmount) * 100 : 0}
				<div class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<Label class="text-gray-300">Category</Label>
								<p class="font-medium text-white">
									{getCategoryName(selectedBudgetDetails.category_id)}
								</p>
							</div>
							<div>
							<Label class="text-gray-300">Budget Amount</Label>
								<p class="text-lg font-bold text-white">${detailGoalAmount.toLocaleString()}</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<Label class="text-gray-300">Amount Spent</Label>
								<p class="font-semibold text-red-400">${spentAmount.toLocaleString()}</p>
						</div>
						<div>
							<Label class="text-gray-300">Remaining</Label>
							<p
								class="font-semibold {detailGoalAmount - spentAmount >= 0
									? 'text-green-400'
									: 'text-red-400'}"
							>
								${Math.abs(detailGoalAmount - spentAmount).toLocaleString()}
									{detailGoalAmount - spentAmount < 0 ? ' over' : ''}
							</p>
						</div>
						</div>
						<div class="grid grid-cols-2 gap-4">
						<div>
							<Label class="text-gray-300">Start Date</Label>
								<p class="text-white">
									{new Date(selectedBudgetDetails.start_date).toLocaleDateString()}
								</p>
						</div>
						<div>
							<Label class="text-gray-300">End Date</Label>
								<p class="text-white">
									{new Date(selectedBudgetDetails.end_date).toLocaleDateString()}
								</p>
						</div>
					</div>

					<div class="space-y-2">
						<Label class="text-gray-300">Budget Progress</Label>
						<div class="space-y-2">
							<div class="flex justify-between text-sm">
								<span class="text-gray-300">Usage</span>
								<span class="text-gray-300">
									{detailPercentage.toFixed(1)}%
								</span>
							</div>
							<Progress value={Math.min(detailPercentage, 100)} class="h-3" />
						</div>
						</div>
						<div class="flex gap-2 pt-4">
						<Button
							variant="outline"
							class="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
								onclick={() => (isDetailsOpen = false)}
						>
							Close
						</Button>
						<Button 
							variant="outline" 
								class="flex-1 border-2 border-green-500 bg-gray-900 font-semibold text-green-400 shadow-lg hover:bg-green-500/20 hover:text-green-300"
							onclick={() => {
								isDetailsOpen = false;
								if (selectedBudgetDetails) {
									handleEditBudget(selectedBudgetDetails);
								}
							}}
						>
								<Icon icon="lucide:edit-3" class="mr-1 h-4 w-4" />
							Edit Budget
						</Button>
						<Button 
							variant="outline" 
								class="flex-1 border-2 border-red-500 bg-gray-900 font-semibold text-red-400 shadow-lg hover:bg-red-500/20 hover:text-red-300"
							onclick={() => {
								if (selectedBudgetDetails) {
									isDetailsOpen = false;
									handleDeleteBudget(selectedBudgetDetails);
								}
							}}
						>
								<Icon icon="lucide:trash-2" class="mr-1 h-4 w-4" />
							Delete
						</Button>
					</div>
				</div>
			{/if}
		</DialogContent>
	</Dialog>

	<!-- Budget Insights -->
		<Card class="border-gray-800 bg-gray-900">
		<CardHeader>
			<CardTitle class="text-white">Budget Insights</CardTitle>
				<CardDescription class="text-gray-400"
					>AI-powered recommendations for your budgets</CardDescription
				>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
					<!-- Alert Box (Red/Yellow) -->
					{#if budgetInsights.alert}
						{#if budgetInsights.alert.type === 'overspending_forecast' && budgetInsights.alert.forecast}
							<div class="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
								<h4 class="font-semibold text-red-400">Overspending Forecast</h4>
								<p class="mt-1 text-sm text-gray-300">
									At your current pace, you're likely to exceed your {getCategoryName(
										budgetInsights.alert.budget.category_id
									)} budget by {budgetInsights.alert.forecast.overspendPercentage.toFixed(0)}% this
									period. You're spending ${budgetInsights.alert.forecast.dailySpendRate.toFixed(2)}
									per day with {budgetInsights.alert.forecast.daysRemaining} days remaining.
					</p>
				</div>
						{:else if budgetInsights.alert.type === 'over_budget' && budgetInsights.alert.overAmount !== undefined}
							<div class="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
								<h4 class="font-semibold text-red-400">Budget Exceeded</h4>
								<p class="mt-1 text-sm text-gray-300">
									Your {getCategoryName(budgetInsights.alert.budget.category_id)} budget has been exceeded
									by ${budgetInsights.alert.overAmount.toFixed(2)}. Consider adjusting your spending
									or increasing the budget limit.
								</p>
							</div>
						{:else if budgetInsights.alert.type === 'near_limit' && budgetInsights.alert.percentage !== undefined}
							<div class="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
								<h4 class="font-semibold text-yellow-400">Budget Alert</h4>
								<p class="mt-1 text-sm text-gray-300">
									Your {getCategoryName(budgetInsights.alert.budget.category_id)} budget is at {budgetInsights.alert.percentage.toFixed(
										0
									)}% capacity. Consider reducing usage or adjusting your budget.
								</p>
							</div>
						{/if}
					{:else}
						<div class="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
							<h4 class="font-semibold text-green-400">All Clear!</h4>
							<p class="mt-1 text-sm text-gray-300">
								No budget alerts at this time. Your spending is under control!
							</p>
						</div>
					{/if}

					<!-- Progress Box (Green) - Only show if there's good/great progress -->
					{#if budgetInsights.progress}
						<div class="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
							<h4 class="font-semibold text-green-400">
								{budgetInsights.progress.progressMargin > 25 ? 'Great Progress' : 'Good Progress'}
							</h4>
							<p class="mt-1 text-sm text-gray-300">
								Excellent pacing on your {getCategoryName(
									budgetInsights.progress.budget.category_id
								)} budget! You've used {budgetInsights.progress.spentPercentage.toFixed(0)}% of your
								budget while {budgetInsights.progress.timeElapsedPercentage.toFixed(0)}% of the time
								period has passed.
					</p>
				</div>
					{/if}

					<!-- Tip Box (Blue) -->
					{#if budgetInsights.tip}
						{#if budgetInsights.tip.type === 'reallocation' && budgetInsights.tip.underutilized && budgetInsights.tip.overutilized}
							<div class="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
					<h4 class="font-semibold text-blue-400">Optimization Tip</h4>
								<p class="mt-1 text-sm text-gray-300">
									Consider reallocating unused funds from your {getCategoryName(
										budgetInsights.tip.underutilized.category_id
									)} budget to categories where you're approaching limits like {getCategoryName(
										budgetInsights.tip.overutilized.category_id
									)}.
								</p>
							</div>
						{:else if budgetInsights.tip.type === 'monitoring' && budgetInsights.tip.budgetCount !== undefined}
							<div class="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
								<h4 class="font-semibold text-blue-400">Budget Monitoring</h4>
								<p class="mt-1 text-sm text-gray-300">
									You have {budgetInsights.tip.budgetCount} active budget{budgetInsights.tip
										.budgetCount > 1
										? 's'
										: ''}. Regular monitoring helps maintain healthy spending habits.
								</p>
							</div>
						{/if}
					{:else}
						<div class="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
							<h4 class="font-semibold text-blue-400">Budget Tip</h4>
							<p class="mt-1 text-sm text-gray-300">
								Set up budgets for different expense categories to better track and control your
								spending patterns.
							</p>
						</div>
					{/if}
				</div>
		</CardContent>
	</Card>
	{/if}
</div>
