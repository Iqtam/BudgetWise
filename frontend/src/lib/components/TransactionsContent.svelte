<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { ArrowDownIcon, ArrowUpIcon, Camera, MessageSquare, Plus, Search, Repeat, ArrowUpDown } from 'lucide-svelte';

	let transactions = $state([
		{
			id: 1,
			description: "Salary Deposit",
			amount: 5420.0,
			type: "income",
			category: "Salary",
			date: "2024-01-15",
			event: "Monthly paycheck",
			isRecurrent: true,
		},
		{ id: 2, description: "Grocery Store", amount: -125.5, type: "expense", category: "Food", date: "2024-01-14" },
		{ id: 3, description: "Gas Station", amount: -45.2, type: "expense", category: "Transportation", date: "2024-01-13" },
		{
			id: 4,
			description: "Freelance Payment",
			amount: 800.0,
			type: "income",
			category: "Freelance",
			date: "2024-01-12",
			event: "Website project completion",
		},
		{
			id: 5,
			description: "Netflix Subscription",
			amount: -15.99,
			type: "expense",
			category: "Entertainment",
			date: "2024-01-11",
			isRecurrent: true,
		},
		{
			id: 6,
			description: "Coffee Shop",
			amount: -4.5,
			type: "expense",
			category: "Food",
			date: "2024-01-10",
			event: "Morning coffee",
		},
		{
			id: 7,
			description: "Investment Dividend",
			amount: 125.0,
			type: "income",
			category: "Investment",
			date: "2024-01-09",
			isRecurrent: true,
		},
		{
			id: 8,
			description: "Phone Bill",
			amount: -89.99,
			type: "expense",
			category: "Utilities",
			date: "2024-01-08",
			isRecurrent: true,
		},
		{
			id: 9,
			description: "Restaurant Dinner",
			amount: -67.85,
			type: "expense",
			category: "Food",
			date: "2024-01-07",
			event: "Date night",
		},
		{ id: 10, description: "Uber Ride", amount: -23.4, type: "expense", category: "Transportation", date: "2024-01-06" },
		{
			id: 11,
			description: "Amazon Purchase",
			amount: -156.99,
			type: "expense",
			category: "Shopping",
			date: "2024-01-05",
			event: "Home supplies",
		},
		{
			id: 12,
			description: "Gym Membership",
			amount: -49.99,
			type: "expense",
			category: "Health",
			date: "2024-01-04",
			isRecurrent: true,
		},
		{
			id: 13,
			description: "Movie Theater",
			amount: -28.5,
			type: "expense",
			category: "Entertainment",
			date: "2024-01-03",
		},
		{ id: 14, description: "Pharmacy", amount: -34.75, type: "expense", category: "Health", date: "2024-01-02" },
		{ id: 15, description: "Fast Food", amount: -12.99, type: "expense", category: "Food", date: "2024-01-01" },
		{ id: 16, description: "Parking Fee", amount: -8.0, type: "expense", category: "Transportation", date: "2023-12-31" },
		{
			id: 17,
			description: "Online Subscription",
			amount: -9.99,
			type: "expense",
			category: "Entertainment",
			date: "2023-12-30",
			isRecurrent: true,
		},
		{
			id: 18,
			description: "Clothing Store",
			amount: -89.99,
			type: "expense",
			category: "Shopping",
			date: "2023-12-29",
			event: "Winter clothes",
		},
	]);

	let searchTerm = $state("");
	let filterCategory = $state("all");
	let sortBy = $state("date");
	let isDialogOpen = $state(false);
	let activeTab = $state("expense");
	let currentPage = $state(1);
	let itemsPerPage = 10;
	let categories = $state([
		"Food",
		"Transportation",
		"Entertainment",
		"Utilities",
		"Salary",
		"Freelance",
		"Investment",
		"Shopping",
		"Health",
	]);
	let isDetailsOpen = $state(false);
	let selectedTransactionDetails = $state<any>(null);
	let isNewCategoryOpen = $state(false);
	let newCategoryName = $state("");

	// Form fields
	let formDescription = $state("");
	let formAmount = $state("");
	let formType = $state("");
	let formCategory = $state("");
	let formEvent = $state("");
	let formDate = $state(new Date().toISOString().split("T")[0]);
	let formIsRecurrent = $state(false);

	// Reset current page when filters change
	$effect(() => {
		currentPage = 1;
	});

	function filterAndSortTransactions(type: "income" | "expense") {
		const filtered = transactions
			.filter((transaction) => {
				const matchesType = transaction.type === type;
				const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
				const matchesCategory =
					filterCategory === "all" || transaction.category.toLowerCase() === filterCategory.toLowerCase();
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

	function handleAddTransaction(event: Event) {
		event.preventDefault();
		const newTransaction = {
			id: transactions.length + 1,
			description: formDescription,
			amount: formType === "expense" ? -Math.abs(Number(formAmount)) : Math.abs(Number(formAmount)),
			type: formType,
			category: formCategory,
			event: formEvent || undefined,
			date: formDate || new Date().toISOString().split("T")[0],
			isRecurrent: formIsRecurrent,
		};

		transactions = [newTransaction, ...transactions];
		isDialogOpen = false;
		
		// Reset form
		formDescription = "";
		formAmount = "";
		formType = "";
		formCategory = "";
		formEvent = "";
		formDate = "";
		formIsRecurrent = false;
	}

	function handleViewDetails(transaction: any) {
		selectedTransactionDetails = transaction;
		isDetailsOpen = true;
	}

	function handleAddCategory(event: Event) {
		event.preventDefault();
		if (newCategoryName && !categories.includes(newCategoryName)) {
			categories = [...categories, newCategoryName];
			newCategoryName = "";
			isNewCategoryOpen = false;
			// You can add a toast notification here if you have toast implemented
		}
	}

	let paginatedData = $derived(filterAndSortTransactions(activeTab as "income" | "expense"));
	let currentTransactions = $derived(paginatedData.transactions);
</script>

<div class="flex-1 space-y-6 p-6 bg-gray-950">
	<!-- Header with Add Button -->
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
							</div>

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

							<div class="space-y-2">
								<Label for="category">Category</Label>
								<div class="flex gap-2">
									<select bind:value={formCategory} required class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
										<option value="">Select category</option>
										{#each categories as category}
											<option value={category}>
												{category === "Food" ? "Food & Dining" : category}
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
												<DialogDescription class="text-gray-400">
													Create a new transaction category
												</DialogDescription>
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
							</div>

							<Button
								type="submit"
								class="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
							>
								Add Transaction
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
			</DialogContent>
		</Dialog>
	</div>

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
											</div>
											<div>
												<div class="flex items-center gap-2">
													<p class="font-medium text-white">{transaction.description}</p>
													{#if transaction.isRecurrent}
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
										</div>
										<div class="text-right">
											<p class="font-semibold text-red-400">-${Math.abs(transaction.amount).toFixed(2)}</p>
											<Badge variant="secondary" class="text-xs bg-gray-800 text-gray-300">
												{transaction.category}
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
											</div>
											<div>
												<div class="flex items-center gap-2">
													<p class="font-medium text-white">{transaction.description}</p>
													{#if transaction.isRecurrent}
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
										</div>
										<div class="text-right">
											<p class="font-semibold text-green-400">+${Math.abs(transaction.amount).toFixed(2)}</p>
											<Badge variant="secondary" class="text-xs bg-gray-800 text-gray-300">
												{transaction.category}
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
					{/if}
					{#if selectedTransactionDetails.isRecurrent}
						<div class="flex items-center gap-2">
							<Repeat class="h-4 w-4 text-blue-400" />
							<span class="text-blue-400">Recurring Transaction</span>
						</div>
					{/if}
				</div>
			{/if}
		</DialogContent>
	</Dialog>
</div> 