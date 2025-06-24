<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/checkbox';	import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { ArrowDownIcon, ArrowUpIcon, Camera, MessageSquare, Plus, Search, Repeat, ArrowUpDown } from 'lucide-svelte';
	import { transactionService, type Transaction } from '$lib/services/transactions';
	import { categoryService, type Category } from '$lib/services/categories';
	import { firebaseUser, loading as authLoading } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	// State variables
	let transactions = $state<Transaction[]>([]);
	let categories = $state<Category[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let searchTerm = $state("");
	let filterCategory = $state("all");
	let sortBy = $state("date");
	let isDialogOpen = $state(false);
	let activeTab = $state("expense");
	let currentPage = $state(1);
	let itemsPerPage = 10;
	let isDetailsOpen = $state(false);
	let selectedTransactionDetails = $state<Transaction | null>(null);
	let isSaving = $state(false);
	let isNewCategoryOpen = $state(false);
	let newCategoryName = $state("");
	let newCategoryType = $state<'income' | 'expense'>('expense');

	// Form fields
	let formDescription = $state("");
	let formAmount = $state("");
	let formType = $state("");
	let formCategory = $state("");
	let formEvent = $state("");
	let formDate = $state(new Date().toISOString().split("T")[0]);
	let formIsRecurrent = $state(false);

	// Wait for authentication before loading data
	$effect(() => {
		if (!$authLoading && $firebaseUser) {
			loadData();
		}
	});
	// Function to load transactions and categories from API
	async function loadData() {
		if (!$firebaseUser) {
			error = 'User not authenticated';
			isLoading = false;
			return;
		}

		isLoading = true;
		error = null;
		
		try {
			// Load categories and transactions in parallel
			const [categoriesData, transactionsData] = await Promise.all([
				categoryService.getCategories(),
				transactionService.getAllTransactions()
			]);
			
			categories = categoriesData;
			transactions = transactionsData;
		} catch (err) {
			console.error('Error loading data:', err);
			error = err instanceof Error ? err.message : 'Failed to load data';
		} finally {
			isLoading = false;
		}
	}

	// Reset current page when filters change
	$effect(() => {
		currentPage = 1;
	});

	function filterAndSortTransactions(type: "income" | "expense") {
		if (!transactions.length) {
			return {
				transactions: [],
				totalCount: 0,
				totalPages: 0,
			};
		}
		const filtered = transactions
			.filter((transaction) => {
				const matchesType = transaction.type === type;
				const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
				const matchesCategory = filterCategory === "all" || 
					(filterCategory === "none" && !transaction.category_id) ||
					(filterCategory !== "none" && transaction.category_id?.toString() === filterCategory);
				return matchesType && matchesSearch && matchesCategory;
			})
			.sort((a, b) => {
				if (sortBy === "date") {
					return new Date(b.date).getTime() - new Date(a.date).getTime();
				} else if (sortBy === "amount") {
					return Math.abs(b.amount) - Math.abs(a.amount);
				}
				return 0;
			});

		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;

		return {
			transactions: filtered.slice(startIndex, endIndex),
			totalCount: filtered.length,
			totalPages: Math.ceil(filtered.length / itemsPerPage),
		};
	}

	async function handleAddTransaction(event: Event) {
		event.preventDefault();
		isSaving = true;
		error = null;

		try {
			const newTransactionData = {
				description: formDescription,
				amount: formType === "expense" ? -Math.abs(Number(formAmount)) : Math.abs(Number(formAmount)),
				type: formType as 'income' | 'expense',
				category_id: formCategory || undefined,
				date: formDate || new Date().toISOString().split("T")[0],
				recurrence: formIsRecurrent ? 'monthly' : undefined,
			};

			// Create transaction via API
			const newTransaction = await transactionService.createTransaction(newTransactionData);
			
			// Add to local state
			transactions = [newTransaction, ...transactions];
			
			// Close dialog and reset form
			isDialogOpen = false;
			resetForm();
		} catch (err) {
			console.error('Error creating transaction:', err);
			error = err instanceof Error ? err.message : 'Failed to create transaction';
		} finally {
			isSaving = false;
		}
	}
	function resetForm() {
		formDescription = "";
		formAmount = "";
		formType = "";
		formCategory = "";
		formEvent = "";
		formDate = new Date().toISOString().split("T")[0];
		formIsRecurrent = false;
	}

	// Function to handle creating a new category
	async function handleCreateCategory(event: Event) {
		event.preventDefault();
		if (!newCategoryName.trim()) return;

		try {
			const newCategory = await categoryService.createCategory({
				name: newCategoryName.trim(),
				type: newCategoryType,
			});

			// Add the new category to the list
			categories = [...categories, newCategory];
			
			// Auto-select the new category
			formCategory = newCategory.id.toString();
			
			// Close the new category dialog and reset form
			isNewCategoryOpen = false;
			newCategoryName = "";
			newCategoryType = 'expense';
		} catch (err) {
			console.error('Error creating category:', err);
			error = err instanceof Error ? err.message : 'Failed to create category';
		}
	}

	function handleViewDetails(transaction: Transaction) {
		selectedTransactionDetails = transaction;
		isDetailsOpen = true;
	}
	let paginatedData = $derived(filterAndSortTransactions(activeTab as "income" | "expense"));
	let currentTransactions = $derived(paginatedData.transactions);
</script>

<div class="flex-1 space-y-6 p-6 bg-gray-950">	<!-- Loading State -->
	{#if $authLoading || isLoading}
		<div class="flex items-center justify-center min-h-[400px]">
			<div class="text-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
				<p class="text-gray-400">
					{$authLoading ? 'Authenticating...' : 'Loading transactions...'}
				</p>
			</div>
		</div>
	{:else if error}
		<!-- Error State -->
		<div class="flex items-center justify-center min-h-[400px]">
			<div class="text-center">
				<div class="text-red-500 text-xl mb-4">⚠️</div>
				<p class="text-red-400 mb-4">{error}</p>
				<Button onclick={loadData} variant="outline" class="border-gray-600 text-gray-300 hover:bg-gray-700">
					Try Again
				</Button>
			</div>
		</div>
	{:else}
		<!-- Main Content -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold text-white">Transaction History</h2>
			<p class="text-gray-400">Manage all your financial transactions</p>
		</div>
		<Dialog bind:open={isDialogOpen}>
			<DialogTrigger>
				<div class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white cursor-pointer">
					<Plus class="h-4 w-4 mr-2" />
					Add Transaction
				</div>
			</DialogTrigger>
			<DialogContent class="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
				<DialogHeader>
					<DialogTitle>Add New Transaction</DialogTitle>
					<DialogDescription class="text-gray-400">
						Record a new income or expense transaction
					</DialogDescription>
				</DialogHeader>
				<Tabs value="manual" class="w-full">
					<TabsList class="grid w-full grid-cols-3 bg-gray-700">
						<TabsTrigger value="manual" class="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300">
							Manual
						</TabsTrigger>
						<TabsTrigger value="chat" class="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300">
							Chat
						</TabsTrigger>
						<TabsTrigger value="ocr" class="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300">
							Receipt OCR
						</TabsTrigger>
					</TabsList>

					<TabsContent value="manual">
						<form onsubmit={handleAddTransaction} class="space-y-4">
							<div class="space-y-2">
								<Label for="description">Description</Label>
								<Input
									id="description"
									bind:value={formDescription}
									placeholder="Enter transaction description"
									required
									class="bg-gray-700 border-gray-600"
								/>
							</div>							<div class="grid grid-cols-2 gap-4">
								<div class="space-y-2">
									<Label for="amount">Amount</Label>
									<Input
										id="amount"
										bind:value={formAmount}
										type="number"
										step="0.01"
										placeholder="0.00"
										required
										class="bg-gray-700 border-gray-600"
									/>
								</div>
								<div class="space-y-2">
									<Label for="type">Type</Label>
									<select bind:value={formType} required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
										<option value="">Select transaction type</option>
										<option value="income">Income</option>
										<option value="expense">Expense</option>
									</select>
								</div>
							</div><div class="space-y-2">
								<div class="flex items-center justify-between">
									<Label for="category">Category (Optional)</Label>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onclick={() => isNewCategoryOpen = true}
										class="text-blue-400 hover:text-blue-300 p-0 h-auto font-normal"
									>
										+ New Category
									</Button>
								</div>
								<div class="grid grid-cols-1 gap-2">
									<select bind:value={formCategory} class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
										<option value="">No Category</option>
										{#each categories.filter(cat => !formType || cat.type === formType) as category}
											<option value={category.id.toString()}>{category.name}</option>
										{/each}
									</select>
									{#if formCategory}
										{@const selectedCategory = categories.find(cat => cat.id.toString() === formCategory)}
										{#if selectedCategory}
											<div class="text-xs text-gray-400 px-1">
												Selected: {selectedCategory.name} ({selectedCategory.type})
											</div>
										{/if}
									{/if}
								</div>
							</div>							<div class="grid grid-cols-2 gap-4">
								<div class="space-y-2">
									<Label for="event">Event (Optional)</Label>
									<Input
										id="event"
										bind:value={formEvent}
										placeholder="e.g., Birthday dinner, Gas for road trip"
										class="bg-gray-700 border-gray-600"
									/>
								</div>
								<div class="space-y-2">
									<Label for="date">Date</Label>
									<Input
										id="date"
										bind:value={formDate}
										type="date"
										required
										class="bg-gray-700 border-gray-600"
									/>
								</div>
							</div>

							<div class="flex items-center space-x-2 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
								<Checkbox
									id="isRecurrent"
									bind:checked={formIsRecurrent}
									class="border-gray-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 h-5 w-5"
								/>
								<Label for="isRecurrent" class="text-sm font-medium text-white flex items-center gap-2 cursor-pointer">
									<Repeat class="h-4 w-4 text-blue-400" />
									Recurring Transaction (Optional)
								</Label>
							</div>							<Button
								type="submit"
								disabled={isSaving}
								class="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:opacity-50"
							>
								{isSaving ? 'Adding...' : 'Add Transaction'}
							</Button>
						</form>
					</TabsContent>

					<TabsContent value="chat">
						<div class="space-y-4">
							<div class="flex items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-lg">
								<div class="text-center">
									<MessageSquare class="h-12 w-12 text-gray-400 mx-auto mb-4" />
									<h3 class="text-lg font-medium text-white mb-2">Chat Input</h3>
									<p class="text-gray-400 mb-4">Describe your transaction in natural language</p>
									<p class="text-sm text-gray-500">Feature coming soon...</p>
								</div>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="ocr">
						<div class="space-y-4">
							<div class="flex items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-lg">
								<div class="text-center">
									<Camera class="h-12 w-12 text-gray-400 mx-auto mb-4" />
									<h3 class="text-lg font-medium text-white mb-2">Receipt OCR</h3>
									<p class="text-gray-400 mb-4">Upload a receipt to automatically extract transaction details</p>
									<p class="text-sm text-gray-500">Feature coming soon...</p>
								</div>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</DialogContent>		</Dialog>
	</div>

	<!-- New Category Dialog -->
	<Dialog bind:open={isNewCategoryOpen}>
		<DialogContent class="bg-gray-800 border-gray-700">
			<DialogHeader>
				<DialogTitle class="text-white">Create New Category</DialogTitle>
				<DialogDescription class="text-gray-400">
					Add a new category for your transactions
				</DialogDescription>
			</DialogHeader>
			<form onsubmit={handleCreateCategory} class="space-y-4">
				<div class="space-y-2">
					<Label for="categoryName">Category Name</Label>
					<Input
						id="categoryName"
						bind:value={newCategoryName}
						placeholder="Enter category name"
						required
						class="bg-gray-700 border-gray-600"
					/>
				</div>
				<div class="space-y-2">
					<Label for="categoryType">Category Type</Label>
					<select bind:value={newCategoryType} required class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
						<option value="expense">Expense</option>
						<option value="income">Income</option>
					</select>
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
						Create Category
					</Button>
				</div>
			</form>
		</DialogContent>
	</Dialog>

	<!-- Main Content with Tabs -->
	<div class="space-y-6">
		<Tabs bind:value={activeTab} class="w-full">
			<TabsList class="grid w-full grid-cols-2 bg-transparent gap-2 p-0">
				<TabsTrigger 
					value="expense" 
					class="data-[state=active]:bg-red-900 data-[state=active]:border-red-500 data-[state=active]:text-white bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 rounded-lg p-3 transition-all duration-200"
				>
					<ArrowDownIcon class="h-4 w-4 mr-2" />
					Expenses
				</TabsTrigger>
				<TabsTrigger 
					value="income" 
					class="data-[state=active]:bg-green-900 data-[state=active]:border-green-500 data-[state=active]:text-white bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 rounded-lg p-3 transition-all duration-200"
				>
					<ArrowUpIcon class="h-4 w-4 mr-2" />
					Income
				</TabsTrigger>
			</TabsList>

			<TabsContent value="expense" class="space-y-4 mt-6">
				<!-- Filters and Search -->
				<div class="flex flex-col sm:flex-row gap-4">
					<div class="relative flex-1">
						<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
						<Input
							placeholder="Search expenses..."
							bind:value={searchTerm}
							class="pl-10 bg-gray-800 border-gray-700 text-white"
						/>
					</div>
					<div class="flex gap-2">
						<select bind:value={filterCategory} class="w-full sm:w-[180px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white">
							<option value="all">All Categories</option>
							<option value="food">Food & Dining</option>
							<option value="transportation">Transportation</option>
							<option value="entertainment">Entertainment</option>
							<option value="utilities">Utilities</option>
							<option value="shopping">Shopping</option>
							<option value="health">Health</option>
						</select>
						<select bind:value={sortBy} class="w-full sm:w-[140px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white">
							<option value="date">Sort by Date</option>
							<option value="amount">Sort by Amount</option>
						</select>
					</div>
				</div>

				<!-- Expenses Transactions List -->
				<Card class="bg-gray-900 border-gray-800">
					<CardHeader>
						<CardTitle class="text-white flex items-center gap-2">
							<ArrowDownIcon class="h-5 w-5 text-red-400" />
							Expense Transactions
						</CardTitle>
						<CardDescription class="text-gray-400 flex items-center justify-between">
							<span>
								{paginatedData.totalCount} expense transaction{paginatedData.totalCount !== 1 ? "s" : ""} found
								{sortBy === "date" ? " (sorted by date)" : " (sorted by amount)"}
							</span>
							<span class="text-sm">
								Page {currentPage} of {paginatedData.totalPages}
							</span>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							{#if currentTransactions.length === 0}
								<div class="text-center py-8 text-gray-500">
									<p>No expense transactions found</p>
								</div>
							{:else}
								{#each currentTransactions as transaction}
									<div class="flex items-center justify-between p-4 border border-gray-800 rounded-lg hover:bg-gray-800/50 transition-colors">
										<div class="flex items-center space-x-3">
											<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400">
												<ArrowDownIcon class="h-5 w-5" />
											</div>											<div>
												<div class="flex items-center gap-2">
													<p class="font-medium text-white">{transaction.description}</p>
													{#if transaction.recurrence}
														<Badge variant="outline" class="text-xs border-blue-500 text-blue-400">
															<Repeat class="h-3 w-3 mr-1" />
															Recurring
														</Badge>
													{/if}
												</div>
												{#if transaction.event}
													<p class="text-xs text-gray-500">{transaction.event}</p>
												{/if}
												<p class="text-sm text-gray-400">{transaction.date}</p>
											</div>
										</div>										<div class="text-right">
											<p class="font-semibold text-red-400">-${Math.abs(transaction.amount).toFixed(2)}</p>
											<Badge variant="secondary" class="text-xs bg-gray-800 text-gray-300">
												{transaction.category_id ? 'Category ID: ' + transaction.category_id : 'No Category'}
											</Badge>
											<div class="mt-2">
												<Button
													variant="ghost"
													size="sm"
													onclick={() => handleViewDetails(transaction)}
													class="text-gray-400 hover:text-white hover:bg-gray-700"
												>
													View Details
												</Button>
											</div>
										</div>
									</div>
								{/each}
							{/if}
						</div>
						{#if paginatedData.totalPages > 1}
							<div class="flex items-center justify-between pt-4 border-t border-gray-800">
								<div class="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onclick={() => currentPage = Math.max(1, currentPage - 1)}
										disabled={currentPage === 1}
										class="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										onclick={() => currentPage = Math.min(paginatedData.totalPages, currentPage + 1)}
										disabled={currentPage === paginatedData.totalPages}
										class="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Next
									</Button>
								</div>
								<div class="flex items-center gap-1">
									{#each Array.from({ length: Math.min(5, paginatedData.totalPages) }, (_, i) => i + 1) as pageNum}
										{@const isActive = pageNum === currentPage}
										<Button
											variant="outline"
											size="sm"
											onclick={() => currentPage = pageNum}
											class={isActive
												? "bg-blue-600 border-blue-500 text-white hover:bg-blue-700"
												: "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"}
										>
											{pageNum}
										</Button>
									{/each}
									{#if paginatedData.totalPages > 5}
										<span class="text-gray-400 px-2">...</span>
										<Button
											variant="outline"
										size="sm"
											onclick={() => currentPage = paginatedData.totalPages}
											class={currentPage === paginatedData.totalPages
												? "bg-blue-600 border-blue-500 text-white hover:bg-blue-700"
												: "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"}
										>
											{paginatedData.totalPages}
										</Button>
									{/if}
								</div>
								<div class="text-sm text-gray-400">
									Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, paginatedData.totalCount)} of {paginatedData.totalCount}
								</div>
							</div>
						{/if}
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="income" class="space-y-4 mt-6">
				<!-- Filters and Search -->
				<div class="flex flex-col sm:flex-row gap-4">
					<div class="relative flex-1">
						<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
						<Input
							placeholder="Search income..."
							bind:value={searchTerm}
							class="pl-10 bg-gray-800 border-gray-700 text-white"
						/>
					</div>
					<div class="flex gap-2">
						<select bind:value={filterCategory} class="w-full sm:w-[180px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white">
							<option value="all">All Categories</option>
							<option value="salary">Salary</option>
							<option value="freelance">Freelance</option>
							<option value="investment">Investment</option>
						</select>
						<select bind:value={sortBy} class="w-full sm:w-[140px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white">
							<option value="date">Sort by Date</option>
							<option value="amount">Sort by Amount</option>
						</select>
					</div>
				</div>

				<!-- Income Transactions List -->
				<Card class="bg-gray-900 border-gray-800">
					<CardHeader>
						<CardTitle class="text-white flex items-center gap-2">
							<ArrowUpIcon class="h-5 w-5 text-green-400" />
							Income Transactions
						</CardTitle>
						<CardDescription class="text-gray-400 flex items-center justify-between">
							<span>
								{paginatedData.totalCount} income transaction{paginatedData.totalCount !== 1 ? "s" : ""} found
								{sortBy === "date" ? " (sorted by date)" : " (sorted by amount)"}
							</span>
							<span class="text-sm">
								Page {currentPage} of {paginatedData.totalPages}
							</span>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							{#if currentTransactions.length === 0}
								<div class="text-center py-8 text-gray-500">
									<p>No income transactions found</p>
								</div>
							{:else}
								{#each currentTransactions as transaction}
									<div class="flex items-center justify-between p-4 border border-gray-800 rounded-lg hover:bg-gray-800/50 transition-colors">
										<div class="flex items-center space-x-3">
											<div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-400">
												<ArrowUpIcon class="h-5 w-5" />
											</div>											<div>
												<div class="flex items-center gap-2">
													<p class="font-medium text-white">{transaction.description}</p>
													{#if transaction.recurrence}
														<Badge variant="outline" class="text-xs border-blue-500 text-blue-400">
															<Repeat class="h-3 w-3 mr-1" />
															Recurring
														</Badge>
													{/if}
												</div>
												{#if transaction.event}
													<p class="text-xs text-gray-500">{transaction.event}</p>
												{/if}
												<p class="text-sm text-gray-400">{transaction.date}</p>
											</div>
										</div>										<div class="text-right">
											<p class="font-semibold text-green-400">+${Math.abs(transaction.amount).toFixed(2)}</p>
											<Badge variant="secondary" class="text-xs bg-gray-800 text-gray-300">
												{transaction.category_id ? 'Category ID: ' + transaction.category_id : 'No Category'}
											</Badge>
											<div class="mt-2">
												<Button
													variant="ghost"
													size="sm"
													onclick={() => handleViewDetails(transaction)}
													class="text-gray-400 hover:text-white hover:bg-gray-700"
												>
													View Details
												</Button>
											</div>
										</div>
									</div>
								{/each}
							{/if}
						</div>
						{#if paginatedData.totalPages > 1}
							<div class="flex items-center justify-between pt-4 border-t border-gray-800">
								<div class="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onclick={() => currentPage = Math.max(1, currentPage - 1)}
										disabled={currentPage === 1}
										class="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										onclick={() => currentPage = Math.min(paginatedData.totalPages, currentPage + 1)}
										disabled={currentPage === paginatedData.totalPages}
										class="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Next
									</Button>
								</div>
								<div class="flex items-center gap-1">
									{#each Array.from({ length: Math.min(5, paginatedData.totalPages) }, (_, i) => i + 1) as pageNum}
										{@const isActive = pageNum === currentPage}
										<Button
											variant="outline"
											size="sm"
											onclick={() => currentPage = pageNum}
											class={isActive
												? "bg-blue-600 border-blue-500 text-white hover:bg-blue-700"
												: "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"}
										>
											{pageNum}
										</Button>
									{/each}
									{#if paginatedData.totalPages > 5}
										<span class="text-gray-400 px-2">...</span>
										<Button
											variant="outline"
											size="sm"
											onclick={() => currentPage = paginatedData.totalPages}
											class={currentPage === paginatedData.totalPages
												? "bg-blue-600 border-blue-500 text-white hover:bg-blue-700"
												: "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"}
										>
											{paginatedData.totalPages}
										</Button>
									{/if}
								</div>
								<div class="text-sm text-gray-400">
									Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, paginatedData.totalCount)} of {paginatedData.totalCount}
								</div>
							</div>
						{/if}
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	</div>

	<!-- Transaction Details Dialog -->
	<Dialog bind:open={isDetailsOpen}>
		<DialogContent class="sm:max-w-[500px] bg-gray-800 border-gray-700 text-white">
			<DialogHeader>
				<DialogTitle class="flex items-center gap-2">
					{#if selectedTransactionDetails?.type === "income"}
						<ArrowUpIcon class="h-5 w-5 text-green-400" />
						Income Details
					{:else}
						<ArrowDownIcon class="h-5 w-5 text-red-400" />
						Expense Details
					{/if}
				</DialogTitle>
			</DialogHeader>
			{#if selectedTransactionDetails}
				<div class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<p class="text-sm text-gray-400">Description</p>
							<p class="font-medium">{selectedTransactionDetails.description}</p>
						</div>
						<div>
							<p class="text-sm text-gray-400">Amount</p>
							<p class="font-medium {selectedTransactionDetails.type === 'income' ? 'text-green-400' : 'text-red-400'}">
								{selectedTransactionDetails.type === 'income' ? '+' : '-'}${Math.abs(selectedTransactionDetails.amount).toFixed(2)}
							</p>
						</div>
						<div>
							<p class="text-sm text-gray-400">Category</p>
							<Badge variant="secondary" class="bg-gray-700 text-gray-300">
								{selectedTransactionDetails.category}
							</Badge>
						</div>
						<div>
							<p class="text-sm text-gray-400">Date</p>
							<p class="font-medium">{selectedTransactionDetails.date}</p>
						</div>
					</div>
					{#if selectedTransactionDetails.event}
						<div>
							<p class="text-sm text-gray-400">Event</p>
							<p class="font-medium">{selectedTransactionDetails.event}</p>
						</div>
					{/if}					{#if selectedTransactionDetails.recurrence}
						<div class="flex items-center gap-2">
							<Repeat class="h-4 w-4 text-blue-400" />
							<span class="text-blue-400">Recurring Transaction</span>
						</div>
					{/if}
				</div>
			{/if}
		</DialogContent>
	</Dialog>
	{/if}
</div>