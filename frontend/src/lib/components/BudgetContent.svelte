<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Progress } from '$lib/components/ui/progress';
	import { Badge } from '$lib/components/ui/badge';
	import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { PieChart, TrendingUp, AlertTriangle, Plus, DollarSign, Edit, Trash2 } from 'lucide-svelte';
	import { budgetService, type Budget } from '$lib/services/budgets';
	import { categoryService, type Category } from '$lib/services/categories';
	import { firebaseUser, loading as authLoading } from '$lib/stores/auth';
	import { onMount } from 'svelte';	// State variables
	let budgets = $state<Budget[]>([]);
	let categories = $state<Category[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let successMessage = $state<string | null>(null);
	let isBudgetDialogOpen = $state(false);
	let isDetailsOpen = $state(false);
	let selectedBudgetDetails = $state<Budget | null>(null);
	let currentPage = $state(1);
	let itemsPerPage = 10;	let isSaving = $state(false);
	let isNewCategoryOpen = $state(false);
	let newCategoryName = $state("");
	let categoryNameError = $state(false);
	let isEditDialogOpen = $state(false);
	let editingBudget = $state<Budget | null>(null);
	let isDeleting = $state(false);

	// Form fields
	let formCategory = $state("");
	let formBudgetAmount = $state("");
	let formStartDate = $state(new Date().toISOString().split("T")[0]);
	let formEndDate = $state("");

	// Edit form fields
	let editFormCategory = $state("");
	let editFormBudgetAmount = $state("");
	let editFormStartDate = $state("");
	let editFormEndDate = $state("");

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
			const [budgetData, categoryData] = await Promise.all([
				budgetService.getAllBudgets(),
				categoryService.getAllCategories()
			]);
			
			budgets = budgetData;
			categories = categoryData;
		} catch (err) {
			console.error('Error loading data:', err);
			error = err instanceof Error ? err.message : 'Failed to load data';
		} finally {
			isLoading = false;
		}
	}	// Reset current page when budgets change
	$effect(() => {
		currentPage = 1;
	});	// Computed values for budget summary
	let totalBudget = $derived(budgets.reduce((sum, budget) => sum + parseFloat(String(budget.goal_amount || '0')), 0));
	let totalSpent = $derived(budgets.reduce((sum, budget) => sum + getSpentAmount(budget), 0));
	let overallProgress = $derived(totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0);
	let budgetsNearLimit = $derived(budgets.filter((b) => (getSpentAmount(b) / parseFloat(String(b.goal_amount || '0'))) * 100 >= 80).length);
	let totalRemaining = $derived(totalBudget - totalSpent);// Helper function to get category name by ID
	function getCategoryName(categoryId: string | undefined) {
		if (!categoryId) return 'No Category';
		const category = categories.find(c => c.id === categoryId);
		return category ? category.name : 'Unknown Category';
	}	// Helper function to calculate or mock spent amount
	// TODO: This should eventually fetch from transactions API
	function getSpentAmount(budget: Budget): number {
		// Ensure we have a valid budget with goal_amount
		if (!budget || !budget.goal_amount) return 0;
		
		const goalAmount = parseFloat(String(budget.goal_amount));
		if (isNaN(goalAmount) || goalAmount <= 0) return 0;
		
		// For now, return a more realistic mock spent amount based on the budget
		// In a real app, this would be calculated from actual transactions
		
		// Use budget ID as a seed to get consistent mock data
		const seed = parseInt(budget.id.slice(-2), 16) || 1;
		const random = (seed * 9301 + 49297) % 233280 / 233280; // Simple seeded random
		
		// Mock spent percentage between 0% and 120% based on budget duration
		const startDate = new Date(budget.start_date);
		const endDate = new Date(budget.end_date);
		const today = new Date();
		
		// Calculate how far through the budget period we are
		const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
		const daysPassed = Math.min(totalDays, (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
		const progressRatio = Math.max(0, daysPassed / totalDays);
		
		// Base spending on time progress with some randomness
		const baseSpentRatio = progressRatio * (0.5 + random * 0.7); // 50-120% of expected progress
		const mockSpentPercentage = Math.max(0, baseSpentRatio);
		
		return Math.round(goalAmount * mockSpentPercentage * 100) / 100;
	}	async function handleAddCategory(event: Event) {
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
			newCategoryName = "";
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
			endIndex: Math.min(endIndex, budgets.length),
		};	}
	let paginatedData = $derived(getPaginatedBudgets());

	async function handleCreateBudget(event: Event) {
		event.preventDefault();
		
		if (!formBudgetAmount || !formStartDate || !formEndDate) {
			error = 'Please fill in all required fields';
			return;
		}

		isSaving = true;
		error = null;
		try {
			await budgetService.createBudget({
				category_id: formCategory || undefined,
				start_date: formStartDate,
				end_date: formEndDate,
				goal_amount: parseFloat(formBudgetAmount),
			});

			// Reload data to get the new budget
			await loadData();
			
			isBudgetDialogOpen = false;
			
			// Reset form
			formCategory = "";
			formBudgetAmount = "";
			formStartDate = new Date().toISOString().split("T")[0];
			formEndDate = "";

			// Show success message
			successMessage = 'Budget created successfully';

			// Auto-hide success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error creating budget:', err);
			error = err instanceof Error ? err.message : 'Failed to create budget';
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
		editFormCategory = budget.category_id || "";
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

		isSaving = true;
		error = null;
		try {
			await budgetService.updateBudget(editingBudget.id, {
				category_id: editFormCategory || undefined,
				start_date: editFormStartDate,
				end_date: editFormEndDate,
				goal_amount: parseFloat(editFormBudgetAmount),
			});

			// Reload data to get the updated budget
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
			error = err instanceof Error ? err.message : 'Failed to update budget';
		} finally {
			isSaving = false;
		}
	}

	async function handleDeleteBudget(budget: Budget) {
		if (!confirm(`Are you sure you want to delete the budget for "${getCategoryName(budget.category_id)}"?`)) {
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
	function getBudgetStatus(spent: number, budgetAmount: number) {
		if (budgetAmount <= 0) return { status: "No Budget", color: "text-gray-400", bgColor: "bg-gray-500/20" };
		const percentage = (spent / budgetAmount) * 100;
		if (percentage >= 100) return { status: "Over Budget", color: "text-red-400", bgColor: "bg-red-500/20" };
		if (percentage >= 80) return { status: "Near Limit", color: "text-yellow-400", bgColor: "bg-yellow-500/20" };
		return { status: "On Track", color: "text-green-400", bgColor: "bg-green-500/20" };
	}
</script>

<div class="flex-1 space-y-6 p-6 bg-gray-950">
	<!-- Error and Success Messages -->
	{#if error}
		<div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
			<p class="text-red-400 text-sm">{error}</p>
		</div>
	{/if}

	{#if successMessage}
		<div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
			<p class="text-green-400 text-sm">{successMessage}</p>
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
		<Dialog bind:open={isBudgetDialogOpen}>
			<DialogTrigger>
				<Button class="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
					<Plus class="h-4 w-4 mr-2" />
					Create Budget
				</Button>
			</DialogTrigger>
			<DialogContent class="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
				<DialogHeader>
					<DialogTitle>Create New Budget</DialogTitle>
					<DialogDescription class="text-gray-400">
						Set up a new spending budget for a category
					</DialogDescription>
				</DialogHeader>
				<form onsubmit={handleCreateBudget} class="space-y-4">					<div class="space-y-2">
						<Label for="category">Category (Optional)</Label>
						<div class="flex gap-2">
							<select bind:value={formCategory} class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
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
										class="px-3 border-gray-600 text-gray-300 hover:bg-gray-700 bg-gray-800"
									>
										<Plus class="h-4 w-4" />
									</Button>
								</DialogTrigger>
								<DialogContent class="sm:max-w-[300px] bg-gray-800 border-gray-700 text-white">
									<DialogHeader>
										<DialogTitle>Add New Category</DialogTitle>
										<DialogDescription class="text-gray-400">Create a new budget category</DialogDescription>
									</DialogHeader>									<form onsubmit={handleAddCategory} novalidate class="space-y-4">										<div class="space-y-2 relative">
											<Label for="newCategory">Category Name</Label>											<div class="relative group">
												<Input
													id="newCategory"
													bind:value={newCategoryName}
													placeholder="Enter category name"
													oninput={() => categoryNameError = false}
													class="bg-gray-700 {categoryNameError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}"
												/>
												<!-- Error message only shows on hover -->
												<div class="absolute left-0 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
													<div class="bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
														{#if categoryNameError}
															Category name is required
														{:else}
															Please fill out this field
														{/if}
													</div>
												</div>
											</div>
										</div>										<div class="flex gap-2">											<Button
												type="button"
												variant="outline"
												onclick={() => {
													isNewCategoryOpen = false;
													categoryNameError = false;
													newCategoryName = "";
												}}
												class="flex-1 bg-black border-black text-red-500 hover:bg-gray-900 font-bold"
											>
												Cancel
											</Button>
											<Button
												type="submit"
												class="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-bold"
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
							class="bg-gray-700 border-gray-600"
						/>
					</div>

					<div class="space-y-2">
						<Label for="startDate">Start Date</Label>
						<Input
							id="startDate"
							bind:value={formStartDate}
							type="date"
							required
							class="bg-gray-700 border-gray-600"
						/>
					</div>

					<div class="space-y-2">
						<Label for="endDate">End Date</Label>
						<Input 
							id="endDate" 
							bind:value={formEndDate} 
							type="date" 
							required 
							class="bg-gray-700 border-gray-600" 
						/>
					</div>					<Button
						type="submit"
						disabled={isSaving}
						class="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
					>
						{isSaving ? 'Creating...' : 'Create Budget'}
					</Button>
				</form>
			</DialogContent>		</Dialog>
	</div>

	<!-- Edit Budget Dialog -->
	<Dialog bind:open={isEditDialogOpen}>
		<DialogContent class="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
			<DialogHeader>
				<DialogTitle>Edit Budget</DialogTitle>
				<DialogDescription class="text-gray-400">
					Update your budget settings
				</DialogDescription>
			</DialogHeader>
			<form onsubmit={handleUpdateBudget} class="space-y-4">
				<div class="space-y-2">
					<Label for="editCategory">Category (Optional)</Label>
					<div class="flex gap-2">
						<select bind:value={editFormCategory} class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
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
						class="bg-gray-700 border-gray-600"
					/>
				</div>

				<div class="space-y-2">
					<Label for="editStartDate">Start Date</Label>
					<Input
						id="editStartDate"
						bind:value={editFormStartDate}
						type="date"
						required
						class="bg-gray-700 border-gray-600"
					/>
				</div>

				<div class="space-y-2">
					<Label for="editEndDate">End Date</Label>
					<Input 
						id="editEndDate" 
						bind:value={editFormEndDate} 
						type="date" 
						required 
						class="bg-gray-700 border-gray-600" 
					/>
				</div>

				<div class="flex gap-2">
					<Button
						type="button"
						variant="outline"
						onclick={() => isEditDialogOpen = false}
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
		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Total Budget</CardTitle>
				<DollarSign class="h-4 w-4 text-gray-400" />
			</CardHeader>			<CardContent>
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

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Total Spent</CardTitle>
				<TrendingUp class="h-4 w-4 text-gray-400" />
			</CardHeader>			<CardContent>
				<div class="text-2xl font-bold text-red-400">
					{#if isNaN(totalSpent) || totalSpent <= 0}
						$0
					{:else}
						${totalSpent.toLocaleString()}
					{/if}
				</div>
				<p class="text-xs text-gray-400">
					{totalBudget > 0 && !isNaN(overallProgress) ? `${overallProgress.toFixed(1)}% of total budget` : '0.0% of total budget'}
				</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Remaining</CardTitle>
				<PieChart class="h-4 w-4 text-gray-400" />
			</CardHeader>			<CardContent>
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

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Alerts</CardTitle>
				<AlertTriangle class="h-4 w-4 text-gray-400" />
			</CardHeader>			<CardContent>
				<div class="text-2xl font-bold text-yellow-400">
					{budgetsNearLimit}
				</div>
				<p class="text-xs text-gray-400">Budgets near limit</p>
			</CardContent>
		</Card>
	</div>

	<!-- Budget Categories -->
	<Card class="bg-gray-900 border-gray-800">
		<CardHeader>
			<CardTitle class="text-white">Budget Categories</CardTitle>
			<CardDescription class="text-gray-400 flex items-center justify-between">
				<span>
					Showing {paginatedData.startIndex}-{paginatedData.endIndex} of {paginatedData.totalCount} budgets
				</span>
				<span class="text-sm">
					Page {currentPage} of {paginatedData.totalPages}
				</span>
			</CardDescription>
		</CardHeader>
		<CardContent>			<div class="space-y-6">				{#each paginatedData.budgets as budget}
					{@const spentAmount = getSpentAmount(budget)}
					{@const goalAmount = parseFloat(String(budget.goal_amount || '0'))}
					{@const percentage = goalAmount > 0 ? (spentAmount / goalAmount) * 100 : 0}
					{@const remaining = goalAmount - spentAmount}
					{@const budgetStatus = getBudgetStatus(spentAmount, goalAmount)}
					<div class="border border-gray-800 rounded-lg p-4 space-y-4">
						<div class="flex items-center justify-between">
							<div>
								<div class="flex items-center gap-2">
									<h3 class="font-semibold text-white">{getCategoryName(budget.category_id)}</h3>
									<Badge class="{budgetStatus.bgColor} {budgetStatus.color} border-0">
										{budgetStatus.status}
									</Badge>
								</div>								<p class="text-sm text-gray-400">
									{new Date(budget.start_date).toLocaleDateString()} to {new Date(budget.end_date).toLocaleDateString()}
								</p>
							</div>							<div class="text-right">
								<p class="text-lg font-bold text-white">${spentAmount.toLocaleString()}</p>
								<p class="text-sm text-gray-400">of ${goalAmount.toLocaleString()}</p><div class="mt-2 flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onclick={() => handleViewDetails(budget)}
										class="bg-gray-900 border-2 border-blue-500 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 font-semibold shadow-lg flex-1"
									>
										View Details
									</Button>
									<Button 
										variant="outline" 
										size="sm" 
										onclick={() => handleEditBudget(budget)}
										class="bg-gray-900 border-2 border-green-500 text-green-400 hover:bg-green-500/20 hover:text-green-300 font-semibold shadow-lg flex-1"
									>
										<Edit class="h-4 w-4 mr-1" />
										Edit
									</Button>
									<Button 
										variant="outline" 
										size="sm" 
										onclick={() => handleDeleteBudget(budget)}
										disabled={isDeleting}
										class="bg-gray-900 border-2 border-red-500 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-semibold shadow-lg flex-1 disabled:opacity-50"
									>
										<Trash2 class="h-4 w-4 mr-1" />
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
							</p>						</div>
					</div>
				{/each}
			</div>

			{#if paginatedData.totalPages > 1}
				<div class="flex items-center justify-between pt-4 border-t border-gray-800">
					<div class="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onclick={() => currentPage = Math.max(1, currentPage - 1)}
							disabled={currentPage === 1}
							class="border-gray-600 text-gray-300 hover:bg-gray-700"
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onclick={() => currentPage = Math.min(paginatedData.totalPages, currentPage + 1)}
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
								variant={isActive ? "default" : "outline"}
								size="sm"
								onclick={() => currentPage = pageNum}
								class={isActive
									? "bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
									: "border-gray-600 text-gray-300 hover:bg-gray-700"}
							>
								{pageNum}
							</Button>
						{/each}
						{#if paginatedData.totalPages > 5}
							<span class="text-gray-400 px-2">...</span>
							<Button
								variant={currentPage === paginatedData.totalPages ? "default" : "outline"}
								size="sm"
								onclick={() => currentPage = paginatedData.totalPages}
								class={currentPage === paginatedData.totalPages
									? "bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
									: "border-gray-600 text-gray-300 hover:bg-gray-700"}
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
		<DialogContent class="sm:max-w-[500px] bg-gray-800 border-gray-700 text-white">
			<DialogHeader>
				<DialogTitle class="flex items-center gap-2">
					<PieChart class="h-5 w-5 text-blue-400" />
					Budget Details
				</DialogTitle>
				<DialogDescription class="text-gray-400">Complete information about this budget</DialogDescription>
			</DialogHeader>			{#if selectedBudgetDetails}
				{@const spentAmount = getSpentAmount(selectedBudgetDetails)}
				{@const detailGoalAmount = parseFloat(String(selectedBudgetDetails.goal_amount || '0'))}
				{@const detailPercentage = detailGoalAmount > 0 ? (spentAmount / detailGoalAmount) * 100 : 0}
				<div class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<Label class="text-gray-300">Category</Label>
							<p class="text-white font-medium">{getCategoryName(selectedBudgetDetails.category_id)}</p>
						</div>						<div>
							<Label class="text-gray-300">Budget Amount</Label>
							<p class="text-white font-bold text-lg">${detailGoalAmount.toLocaleString()}</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<Label class="text-gray-300">Amount Spent</Label>
							<p class="text-red-400 font-semibold">${spentAmount.toLocaleString()}</p>
						</div>
						<div>
							<Label class="text-gray-300">Remaining</Label>
							<p
								class="font-semibold {detailGoalAmount - spentAmount >= 0
									? 'text-green-400'
									: 'text-red-400'}"
							>
								${Math.abs(detailGoalAmount - spentAmount).toLocaleString()}
								{detailGoalAmount - spentAmount < 0 ? " over" : ""}
							</p>
						</div>
					</div><div class="grid grid-cols-2 gap-4">
						<div>
							<Label class="text-gray-300">Start Date</Label>
							<p class="text-white">{new Date(selectedBudgetDetails.start_date).toLocaleDateString()}</p>
						</div>
						<div>
							<Label class="text-gray-300">End Date</Label>
							<p class="text-white">{new Date(selectedBudgetDetails.end_date).toLocaleDateString()}</p>
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
					</div>					<div class="flex gap-2 pt-4">
						<Button
							variant="outline"
							class="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
							onclick={() => isDetailsOpen = false}
						>
							Close
						</Button>
						<Button 
							variant="outline" 
							class="flex-1 bg-gray-900 border-2 border-green-500 text-green-400 hover:bg-green-500/20 hover:text-green-300 font-semibold shadow-lg"
							onclick={() => {
								isDetailsOpen = false;
								if (selectedBudgetDetails) {
									handleEditBudget(selectedBudgetDetails);
								}
							}}
						>
							<Edit class="h-4 w-4 mr-1" />
							Edit Budget
						</Button>
						<Button 
							variant="outline" 
							class="flex-1 bg-gray-900 border-2 border-red-500 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-semibold shadow-lg"
							onclick={() => {
								if (selectedBudgetDetails) {
									isDetailsOpen = false;
									handleDeleteBudget(selectedBudgetDetails);
								}
							}}
						>
							<Trash2 class="h-4 w-4 mr-1" />
							Delete
						</Button>
					</div>
				</div>
			{/if}
		</DialogContent>
	</Dialog>

	<!-- Budget Insights -->
	<Card class="bg-gray-900 border-gray-800">
		<CardHeader>
			<CardTitle class="text-white">Budget Insights</CardTitle>
			<CardDescription class="text-gray-400">AI-powered recommendations for your budgets</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
					<h4 class="font-semibold text-red-400">Budget Alert</h4>
					<p class="text-sm text-gray-300 mt-1">
						Your Utilities budget is at 98% capacity. Consider reducing usage or adjusting your budget.
					</p>
				</div>

				<div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
					<h4 class="font-semibold text-green-400">Great Progress</h4>
					<p class="text-sm text-gray-300 mt-1">
						You're doing well with your Health & Fitness budget - only 57% used with plenty of time remaining.
					</p>
				</div>

				<div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
					<h4 class="font-semibold text-blue-400">Optimization Tip</h4>
					<p class="text-sm text-gray-300 mt-1">
						Consider reallocating unused Travel budget to categories where you're approaching limits.
					</p>
				</div>			</div>
		</CardContent>
	</Card>
	{/if}
</div>