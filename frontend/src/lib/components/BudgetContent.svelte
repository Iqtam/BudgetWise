<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Progress } from '$lib/components/ui/progress';
	import { Badge } from '$lib/components/ui/badge';
	import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { PieChart, TrendingUp, AlertTriangle, Plus, DollarSign } from 'lucide-svelte';

	const mockBudgets = [
		{ id: 1, category: "Food & Dining", budgetAmount: 800, spent: 650, startDate: "2024-01-01", endDate: "2024-01-31" },
		{ id: 2, category: "Transportation", budgetAmount: 300, spent: 280, startDate: "2024-01-01", endDate: "2024-01-31" },
		{ id: 3, category: "Entertainment", budgetAmount: 200, spent: 150, startDate: "2024-01-01", endDate: "2024-01-31" },
		{ id: 4, category: "Utilities", budgetAmount: 250, spent: 245, startDate: "2024-01-01", endDate: "2024-01-31" },
		{ id: 5, category: "Shopping", budgetAmount: 400, spent: 320, startDate: "2024-01-01", endDate: "2024-01-31" },
		{ id: 6, category: "Health & Fitness", budgetAmount: 150, spent: 85, startDate: "2024-01-01", endDate: "2024-01-31" },
		{ id: 7, category: "Education", budgetAmount: 300, spent: 200, startDate: "2024-01-01", endDate: "2024-01-31" },
		{ id: 8, category: "Travel", budgetAmount: 500, spent: 0, startDate: "2024-01-01", endDate: "2024-01-31" },
		{ id: 9, category: "Insurance", budgetAmount: 180, spent: 180, startDate: "2024-01-01", endDate: "2024-01-31" },
		{ id: 10, category: "Savings", budgetAmount: 1000, spent: 800, startDate: "2024-01-01", endDate: "2024-01-31" },
		{ id: 11, category: "Gifts", budgetAmount: 100, spent: 75, startDate: "2024-01-01", endDate: "2024-01-31" },
		{ id: 12, category: "Personal Care", budgetAmount: 120, spent: 95, startDate: "2024-01-01", endDate: "2024-01-31" },
		{
			id: 13,
			category: "Home Maintenance",
			budgetAmount: 200,
			spent: 150,
			startDate: "2024-01-01",
			endDate: "2024-01-31",
		},
		{ id: 14, category: "Subscriptions", budgetAmount: 80, spent: 75, startDate: "2024-01-01", endDate: "2024-01-31" },
		{ id: 15, category: "Miscellaneous", budgetAmount: 150, spent: 120, startDate: "2024-01-01", endDate: "2024-01-31" },
	];

	let budgets = $state([...mockBudgets]);
	let isBudgetDialogOpen = $state(false);
	let isDetailsOpen = $state(false);
	let selectedBudgetDetails = $state<any>(null);
	let currentPage = $state(1);
	let itemsPerPage = 10;

	let categories = $state([
		"Food & Dining",
		"Transportation",
		"Entertainment",
		"Utilities",
		"Shopping",
		"Health & Fitness",
		"Education",
		"Travel",
		"Insurance",
		"Savings",
		"Gifts",
		"Personal Care",
		"Home Maintenance",
		"Subscriptions",
		"Miscellaneous",
	]);
	let isNewCategoryOpen = $state(false);
	let newCategoryName = $state("");

	// Form fields
	let formCategory = $state("");
	let formBudgetAmount = $state("");
	let formStartDate = $state(new Date().toISOString().split("T")[0]);
	let formEndDate = $state("");

	// Reset current page when budgets change
	$effect(() => {
		currentPage = 1;
	});

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
		};
	}

	let paginatedData = $derived(getPaginatedBudgets());
	let totalBudget = $derived(budgets.reduce((sum, budget) => sum + budget.budgetAmount, 0));
	let totalSpent = $derived(budgets.reduce((sum, budget) => sum + budget.spent, 0));
	let overallProgress = $derived((totalSpent / totalBudget) * 100);

	function handleCreateBudget(event: Event) {
		event.preventDefault();
		const newBudget = {
			id: budgets.length + 1,
			category: formCategory,
			budgetAmount: parseFloat(formBudgetAmount),
			spent: 0,
			startDate: formStartDate,
			endDate: formEndDate,
		};

		budgets = [...budgets, newBudget];
		isBudgetDialogOpen = false;
		
		// Reset form
		formCategory = "";
		formBudgetAmount = "";
		formStartDate = new Date().toISOString().split("T")[0];
		formEndDate = "";
	}

	function handleViewDetails(budget: any) {
		selectedBudgetDetails = budget;
		isDetailsOpen = true;
	}

	function getBudgetStatus(spent: number, budgetAmount: number) {
		const percentage = (spent / budgetAmount) * 100;
		if (percentage >= 100) return { status: "Over Budget", color: "text-red-400", bgColor: "bg-red-500/20" };
		if (percentage >= 80) return { status: "Near Limit", color: "text-yellow-400", bgColor: "bg-yellow-500/20" };
		return { status: "On Track", color: "text-green-400", bgColor: "bg-green-500/20" };
	}

	function handleAddCategory(event: Event) {
		event.preventDefault();
		if (newCategoryName && !categories.includes(newCategoryName)) {
			categories = [...categories, newCategoryName];
			newCategoryName = "";
			isNewCategoryOpen = false;
		}
	}
</script>

<div class="flex-1 space-y-6 p-6 bg-gray-950">
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
				<form onsubmit={handleCreateBudget} class="space-y-4">
					<div class="space-y-2">
						<Label for="category">Category</Label>
						<div class="flex gap-2">
							<select bind:value={formCategory} required class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
								<option value="">Select category</option>
								{#each categories as category}
									<option value={category}>
										{category}
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
									</DialogHeader>
									<form onsubmit={handleAddCategory} class="space-y-4">
										<div class="space-y-2">
											<Label for="newCategory">Category Name</Label>
											<Input
												id="newCategory"
												bind:value={newCategoryName}
												placeholder="Enter category name"
												required
												class="bg-gray-700 border-gray-600"
											/>
										</div>
										<div class="flex gap-2">
											<Button
												type="button"
												variant="outline"
												onclick={() => isNewCategoryOpen = false}
												class="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
											>
												Cancel
											</Button>
											<Button
												type="submit"
												class="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
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
					</div>

					<Button
						type="submit"
						class="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
					>
						Create Budget
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	</div>

	<!-- Budget Overview -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Total Budget</CardTitle>
				<DollarSign class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">${totalBudget.toLocaleString()}</div>
				<p class="text-xs text-gray-400">{budgets.length} active budgets</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Total Spent</CardTitle>
				<TrendingUp class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-red-400">${totalSpent.toLocaleString()}</div>
				<p class="text-xs text-gray-400">{overallProgress.toFixed(1)}% of total budget</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Remaining</CardTitle>
				<PieChart class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-green-400">${(totalBudget - totalSpent).toLocaleString()}</div>
				<p class="text-xs text-gray-400">Available to spend</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Alerts</CardTitle>
				<AlertTriangle class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-yellow-400">
					{budgets.filter((b) => (b.spent / b.budgetAmount) * 100 >= 80).length}
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
		<CardContent>
			<div class="space-y-6">
				{#each paginatedData.budgets as budget}
					{@const percentage = (budget.spent / budget.budgetAmount) * 100}
					{@const remaining = budget.budgetAmount - budget.spent}
					{@const budgetStatus = getBudgetStatus(budget.spent, budget.budgetAmount)}
					<div class="border border-gray-800 rounded-lg p-4 space-y-4">
						<div class="flex items-center justify-between">
							<div>
								<div class="flex items-center gap-2">
									<h3 class="font-semibold text-white">{budget.category}</h3>
									<Badge class="{budgetStatus.bgColor} {budgetStatus.color} border-0">
										{budgetStatus.status}
									</Badge>
								</div>
								<p class="text-sm text-gray-400">
									{budget.startDate} to {budget.endDate}
								</p>
							</div>
							<div class="text-right">
								<p class="text-lg font-bold text-white">${budget.spent.toLocaleString()}</p>
								<p class="text-sm text-gray-400">of ${budget.budgetAmount.toLocaleString()}</p>
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

						<div class="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onclick={() => handleViewDetails(budget)}
								class="border-gray-600 text-gray-300 hover:bg-gray-700"
							>
								View Details
							</Button>
							<Button variant="ghost" size="sm" class="text-gray-400 hover:text-white hover:bg-gray-800">
								Edit Budget
							</Button>
						</div>
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
			</DialogHeader>
			{#if selectedBudgetDetails}
				{@const detailPercentage = (selectedBudgetDetails.spent / selectedBudgetDetails.budgetAmount) * 100}
				<div class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<Label class="text-gray-300">Category</Label>
							<p class="text-white font-medium">{selectedBudgetDetails.category}</p>
						</div>
						<div>
							<Label class="text-gray-300">Budget Amount</Label>
							<p class="text-white font-bold text-lg">${selectedBudgetDetails.budgetAmount.toLocaleString()}</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<Label class="text-gray-300">Amount Spent</Label>
							<p class="text-red-400 font-semibold">${selectedBudgetDetails.spent.toLocaleString()}</p>
						</div>
						<div>
							<Label class="text-gray-300">Remaining</Label>
							<p
								class="font-semibold {selectedBudgetDetails.budgetAmount - selectedBudgetDetails.spent >= 0
									? 'text-green-400'
									: 'text-red-400'}"
							>
								${Math.abs(selectedBudgetDetails.budgetAmount - selectedBudgetDetails.spent).toLocaleString()}
								{selectedBudgetDetails.budgetAmount - selectedBudgetDetails.spent < 0 ? " over" : ""}
							</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<Label class="text-gray-300">Start Date</Label>
							<p class="text-white">{selectedBudgetDetails.startDate}</p>
						</div>
						<div>
							<Label class="text-gray-300">End Date</Label>
							<p class="text-white">{selectedBudgetDetails.endDate}</p>
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
							onclick={() => isDetailsOpen = false}
						>
							Close
						</Button>
						<Button variant="outline" class="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
							Edit Budget
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
				</div>
			</div>
		</CardContent>
	</Card>
</div> 