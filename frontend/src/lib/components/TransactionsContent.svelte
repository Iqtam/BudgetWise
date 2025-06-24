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
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import {
		ArrowDownIcon,
		ArrowUpIcon,
		Camera,
		MessageSquare,
		Plus,
		Search,
		Repeat,
		ArrowUpDown,
		Trash2,
		Edit
	} from 'lucide-svelte';
	import { transactionService, type Transaction } from '$lib/services/transactions';
	import { categoryService, type Category } from '$lib/services/categories';
	import { firebaseUser, loading as authLoading } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import { ocrService, type OCRResult } from '$lib/services/ocr';
	// State variables
	let transactions = $state<Transaction[]>([]);
	let categories = $state<Category[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let successMessage = $state<string | null>(null);
	let searchTerm = $state('');
	let filterCategory = $state('all');
	let sortBy = $state('date');
	let isDialogOpen = $state(false);
	let activeTab = $state('expense');
	let currentPage = $state(1);
	let itemsPerPage = 10;
	let isDetailsOpen = $state(false);
	let selectedTransactionDetails = $state<Transaction | null>(null);
	let isSaving = $state(false);
	let isDeleting = $state(false);
	let isEditOpen = $state(false);
	let editingTransaction = $state<Transaction | null>(null);
	let isNewCategoryOpen = $state(false);
	let newCategoryName = $state('');
	let newCategoryType = $state<'income' | 'expense'>('expense');

	// OCR Receipt state
	let selectedFile = $state<File | null>(null);
	let isProcessingOCR = $state(false);
	let ocrResult = $state<OCRResult | null>(null);
	let ocrError = $state<string | null>(null);
	let fileInputRef: HTMLInputElement;
	let temporaryCategories = $state<Category[]>([]); // For storing temp categories from OCR
	let activeTabValue = $state('manual'); // Track active tab
	// Form fields
	let formDescription = $state('');
	let formAmount = $state('');
	let formType = $state('');
	let formCategory = $state('');
	let formEvent = $state('');
	let formDate = $state(new Date().toISOString().split('T')[0]);
	let formIsRecurrent = $state(false);

	// Edit form fields
	let editDescription = $state('');
	let editAmount = $state('');
	let editType = $state('');
	let editCategory = $state('');
	let editEvent = $state('');
	let editDate = $state('');
	let editIsRecurrent = $state(false);

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

	// Helper function to get category by ID
	function getCategoryById(categoryId: string | null | undefined) {
		if (!categoryId) return null;
		return categories.find((cat) => cat.id.toString() === categoryId.toString());
	}

	// Helper function to format category display
	function getCategoryDisplay(categoryId: string | null | undefined) {
		const category = getCategoryById(categoryId);
		return category ? category.name : 'No Category';
	}

	// Helper function to get filtered categories by type
	function getFilteredCategories(type: string): Category[] {
		return categories.filter((category) => category.type === type);
	}

	// Reset current page when filters change
	$effect(() => {
		currentPage = 1;
	});

	// Clear data when dialog is closed
	$effect(() => {
		if (!isDialogOpen) {
			resetForm();
			resetOCRState();
			temporaryCategories = [];
		}
	});

	function filterAndSortTransactions(type: 'income' | 'expense') {
		if (!transactions.length) {
			return {
				transactions: [],
				totalCount: 0,
				totalPages: 0
			};
		}
		const filtered = transactions
			.filter((transaction) => {
				const matchesType = transaction.type === type;
				const matchesSearch = transaction.description
					.toLowerCase()
					.includes(searchTerm.toLowerCase());
				const matchesCategory =
					filterCategory === 'all' ||
					(filterCategory === 'none' && !transaction.category_id) ||
					(filterCategory !== 'none' && transaction.category_id?.toString() === filterCategory);
				return matchesType && matchesSearch && matchesCategory;
			})
			.sort((a, b) => {
				if (sortBy === 'date') {
					return new Date(b.date).getTime() - new Date(a.date).getTime();
				} else if (sortBy === 'amount') {
					return Math.abs(b.amount) - Math.abs(a.amount);
				}
				return 0;
			});

		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;

		return {
			transactions: filtered.slice(startIndex, endIndex),
			totalCount: filtered.length,
			totalPages: Math.ceil(filtered.length / itemsPerPage)
		};
	}
	async function handleAddTransaction(event: Event) {
		event.preventDefault();

		// Prevent double submission
		if (isSaving) return;

		isSaving = true;
		error = null;
		successMessage = null;

		try {
			// Create category in backend if it's temporary
			let finalCategoryId = formCategory;
			if (formCategory) {
				finalCategoryId = await createCategoryIfNeeded(formCategory);
			}

			const newTransactionData = {
				description: formDescription,
				amount:
					formType === 'expense' ? -Math.abs(Number(formAmount)) : Math.abs(Number(formAmount)),
				type: formType as 'income' | 'expense',
				category_id: finalCategoryId || undefined,
				date: formDate || new Date().toISOString().split('T')[0],
				recurrence: formIsRecurrent ? 'monthly' : undefined
			};

			// Create transaction via API
			const response = await transactionService.createTransaction(newTransactionData);

			// Extract transaction from response (backend returns { message, data })
			const newTransaction = response.data || response;

			// Add to local state (ensure it's valid)
			if (newTransaction && newTransaction.id) {
				transactions = [newTransaction, ...transactions];
			} else {
				console.error('Invalid transaction response:', response);
				throw new Error('Invalid transaction response from server');
			}

			// Show success message
			successMessage = `Transaction "${formDescription}" added successfully!`;

			// Close dialog (form will be reset by $effect)
			isDialogOpen = false;

			// Auto-hide success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error creating transaction:', err);
			error = err instanceof Error ? err.message : 'Failed to create transaction';
			// Don't close dialog on error, let user try again
		} finally {
			isSaving = false;
		}
	}
	function resetForm() {
		formDescription = '';
		formAmount = '';
		formType = '';
		formCategory = '';
		formEvent = '';
		formDate = new Date().toISOString().split('T')[0];
		formIsRecurrent = false;
		activeTabValue = 'manual';
	} // Function to handle creating a new category
	async function handleCreateCategory(event: Event) {
		event.preventDefault();
		if (!newCategoryName.trim()) return;

		try {
			const newCategory = await categoryService.createCategory({
				name: newCategoryName.trim(),
				type: newCategoryType
			});

			// Add the new category to the list
			categories = [...categories, newCategory];

			// Auto-select the new category
			formCategory = newCategory.id.toString();

			// Show success message
			successMessage = `Category "${newCategoryName}" created successfully!`;

			// Close the new category dialog and reset form
			isNewCategoryOpen = false;
			newCategoryName = '';
			newCategoryType = 'expense';

			// Auto-hide success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error creating category:', err);
			error = err instanceof Error ? err.message : 'Failed to create category';
		}
	}

	// Function to handle opening new category dialog
	function handleNewCategoryClick() {
		if (!formType) {
			error = 'Please select a transaction type first';
			return;
		}

		// Set the category type to match the transaction type
		newCategoryType = formType as 'income' | 'expense';
		isNewCategoryOpen = true;
	}

	function handleViewDetails(transaction: Transaction) {
		selectedTransactionDetails = transaction;
		isDetailsOpen = true;
	}
	// Function to handle deleting a transaction
	async function handleDeleteTransaction(transaction: Transaction) {
		const confirmed = confirm(
			`Are you sure you want to delete this transaction: "${transaction.description}"?`
		);

		if (!confirmed) {
			return;
		}

		isDeleting = true;
		try {
			await transactionService.deleteTransaction(transaction.id);

			// Remove the transaction from the local state
			transactions = transactions.filter((t) => t.id !== transaction.id);

			// Show success message
			successMessage = 'Transaction deleted successfully';
			error = null;

			// Auto-hide success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error deleting transaction:', err);
			error = err instanceof Error ? err.message : 'Failed to delete transaction';
		} finally {
			isDeleting = false;
		}
	}

	// Function to handle opening edit dialog
	function handleEditTransaction(transaction: Transaction) {
		editingTransaction = transaction;
		// Pre-fill the edit form with transaction data
		editDescription = transaction.description;
		editAmount = transaction.amount.toString();
		editType = transaction.type;
		editCategory = transaction.category_id || '';
		editEvent = transaction.event || '';
		editDate = transaction.date;
		editIsRecurrent = !!transaction.recurrence;
		isEditOpen = true;
	}

	// Function to handle updating a transaction
	async function handleUpdateTransaction() {
		if (!editingTransaction) return;

		if (!editDescription || !editAmount || !editType) {
			error = 'Please fill in all required fields';
			return;
		}

		isSaving = true;
		try {
			const updatedTransaction = await transactionService.updateTransaction(editingTransaction.id, {
				description: editDescription,
				amount: parseFloat(editAmount),
				type: editType as 'income' | 'expense',
				category_id: editCategory || undefined,
				event: editEvent || undefined,
				date: editDate,
				recurrence: editIsRecurrent ? 'monthly' : undefined
			});
			console.log('Updated transaction response:', updatedTransaction);

			// Update the transaction in the local state
			// Backend returns { message: "...", data: transaction }
			const updatedData = (updatedTransaction as any).data || updatedTransaction;
			const updatedTransactionData = {
				...editingTransaction,
				description: editDescription,
				amount: parseFloat(editAmount),
				type: editType as 'income' | 'expense',
				category_id: editCategory || undefined,
				event: editEvent || undefined,
				date: editDate,
				recurrence: editIsRecurrent ? 'monthly' : undefined,
				...updatedData
			};

			console.log('Updating local transaction:', updatedTransactionData);

			transactions = transactions.map((t) =>
				t.id === editingTransaction!.id ? updatedTransactionData : t
			);

			console.log('Updated transactions array:', transactions);

			// If the transaction type changed, switch to the appropriate tab
			if (editType !== editingTransaction.type) {
				activeTab = editType;
			}

			// Close the edit dialog
			isEditOpen = false;
			editingTransaction = null; // Show success message
			successMessage = 'Transaction updated successfully';
			error = null;

			// Force reactivity by creating a new array reference
			transactions = [...transactions];

			// Auto-hide success message after 3 seconds
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error updating transaction:', err);
			error = err instanceof Error ? err.message : 'Failed to update transaction';
		} finally {
			isSaving = false;
		}
	}

	let paginatedData = $derived(filterAndSortTransactions(activeTab as 'income' | 'expense'));
	let currentTransactions = $derived(paginatedData.transactions);

	// OCR functions
	function handleFileSelected(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			handleFile(target.files[0]);
		}
	}

	function handleFile(file: File) {
		ocrError = null;

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			ocrError = 'Please select a valid image file (JPG, PNG, GIF, WebP)';
			return;
		}

		// Validate file size (10MB)
		const maxSize = 10 * 1024 * 1024;
		if (file.size > maxSize) {
			ocrError = 'File size must be less than 10MB';
			return;
		}

		selectedFile = file;
		processReceipt();
	}

	async function processReceipt() {
		if (!selectedFile) return;

		isProcessingOCR = true;
		ocrError = null;

		try {
			const result = await ocrService.processReceipt(selectedFile);

			// Handle missing or invalid date
			if (!result.date || result.date === '') {
				result.date = new Date().toISOString();
			}

			// Create temporary category if it doesn't exist
			await handleTemporaryCategory(result.category, result.type);

			ocrResult = result;
		} catch (err) {
			ocrError = err instanceof Error ? err.message : 'Failed to process receipt';
		} finally {
			isProcessingOCR = false;
		}
	}

	async function handleOCRConfirm() {
		if (!ocrResult) return;

		// Pre-fill the manual form with OCR data
		formDescription = ocrResult.description;
		formAmount = ocrResult.amount.toString();
		formType = ocrResult.type;
		formDate = ocrResult.date
			? ocrResult.date.split('T')[0]
			: new Date().toISOString().split('T')[0];

		// Find matching category (including temporary ones)
		const allCategories = getAllCategories();
		const matchingCategory = allCategories.find(
			(cat) =>
				cat.name.toLowerCase() === ocrResult!.category.toLowerCase() && cat.type === ocrResult!.type
		);
		if (matchingCategory) {
			formCategory = matchingCategory.id.toString();
		}

		// Add vendor to description if it's different
		if (
			ocrResult.vendor &&
			!ocrResult.description.toLowerCase().includes(ocrResult.vendor.toLowerCase())
		) {
			formDescription = `${ocrResult.description} (${ocrResult.vendor})`;
		}

		// Create category in backend if it's temporary, then submit
		try {
			if (formCategory) {
				formCategory = await createCategoryIfNeeded(formCategory);
			}

			// Automatically submit the transaction
			setTimeout(() => {
				handleAddTransaction(new Event('submit'));
			}, 100);
		} catch (error) {
			console.error('Error creating category:', error);
			ocrError = 'Failed to create category. Please try again.';
		}
	}

	function handleOCREdit() {
		if (!ocrResult) return;

		// Pre-fill the manual form with OCR data for editing
		formDescription = ocrResult.description;
		formAmount = ocrResult.amount.toString();
		formType = ocrResult.type;
		formDate = ocrResult.date
			? ocrResult.date.split('T')[0]
			: new Date().toISOString().split('T')[0];

		// Find matching category (including temporary ones)
		const allCategories = getAllCategories();
		const matchingCategory = allCategories.find(
			(cat) =>
				cat.name.toLowerCase() === ocrResult!.category.toLowerCase() && cat.type === ocrResult!.type
		);
		if (matchingCategory) {
			formCategory = matchingCategory.id.toString();
		}

		// Add vendor to description if it's different
		if (
			ocrResult.vendor &&
			!ocrResult.description.toLowerCase().includes(ocrResult.vendor.toLowerCase())
		) {
			formDescription = `${ocrResult.description} (${ocrResult.vendor})`;
		}

		// Switch to manual tab (keep OCR data for potential return)
		activeTabValue = 'manual';
	}

	// Handle temporary category creation
	async function handleTemporaryCategory(categoryName: string, categoryType: 'income' | 'expense') {
		if (!categoryName) return;

		// Check if category already exists
		const existingCategory = categories.find(
			(cat) => cat.name.toLowerCase() === categoryName.toLowerCase() && cat.type === categoryType
		);

		if (!existingCategory) {
			// Check if it's already in temporary categories
			const tempExists = temporaryCategories.find(
				(cat) => cat.name.toLowerCase() === categoryName.toLowerCase() && cat.type === categoryType
			);

			if (!tempExists) {
				// Create temporary category
				const tempCategory: Category = {
					id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					name: categoryName,
					type: categoryType,
					icon_url: undefined,
					parent_id: undefined
				};

				temporaryCategories = [...temporaryCategories, tempCategory];
			}
		}
	}

	// Get all categories including temporary ones
	function getAllCategories(): Category[] {
		return [...categories, ...temporaryCategories];
	}

	// Create category in backend if it's temporary
	async function createCategoryIfNeeded(categoryId: string): Promise<string> {
		const tempCategory = temporaryCategories.find((cat) => cat.id === categoryId);

		if (tempCategory) {
			try {
				const newCategory = await categoryService.createCategory({
					name: tempCategory.name,
					type: tempCategory.type
				});

				// Remove from temporary and add to real categories
				temporaryCategories = temporaryCategories.filter((cat) => cat.id !== categoryId);
				categories = [...categories, newCategory];

				return newCategory.id.toString();
			} catch (error) {
				console.error('Error creating category:', error);
				throw error;
			}
		}

		return categoryId;
	}

	function resetOCRState() {
		selectedFile = null;
		ocrResult = null;
		ocrError = null;
		isProcessingOCR = false;
	}
</script>

<div class="flex-1 space-y-6 bg-gray-950 p-6">
	<!-- Loading State -->
	{#if $authLoading || isLoading}
		<div class="flex min-h-[400px] items-center justify-center">
			<div class="text-center">
				<div
					class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"
				></div>
				<p class="text-gray-400">
					{$authLoading ? 'Authenticating...' : 'Loading transactions...'}
				</p>
			</div>
		</div>
	{:else if error}
		<!-- Error State -->
		<div class="flex min-h-[400px] items-center justify-center">
			<div class="text-center">
				<div class="mb-4 text-xl text-red-500">⚠️</div>
				<p class="mb-4 text-red-400">{error}</p>
				<Button
					onclick={loadData}
					variant="outline"
					class="border-gray-600 text-gray-300 hover:bg-gray-700"
				>
					Try Again
				</Button>
			</div>
		</div>
	{:else}
		<!-- Success Message -->
		{#if successMessage}
			<div class="mb-4 rounded-lg border border-green-500 bg-green-900/50 p-4">
				<div class="flex items-center gap-2">
					<div class="text-lg text-green-400">✅</div>
					<p class="font-medium text-green-300">{successMessage}</p>
					<Button
						onclick={() => (successMessage = null)}
						variant="ghost"
						size="sm"
						class="ml-auto h-auto p-1 text-green-400 hover:text-green-300"
					>
						×
					</Button>
				</div>
			</div>
		{/if}

		<!-- Main Content -->
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-2xl font-bold text-white">Transaction History</h2>
				<p class="text-gray-400">Manage all your financial transactions</p>
			</div>
			<Dialog bind:open={isDialogOpen}>
				<DialogTrigger>
					<div
						class="ring-offset-background focus-visible:ring-ring inline-flex h-10 cursor-pointer items-center justify-center whitespace-nowrap rounded-md bg-gradient-to-r from-blue-500 to-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:from-blue-600 hover:to-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
					>
						<Plus class="mr-2 h-4 w-4" />
						Add Transaction
					</div>
				</DialogTrigger>
				<DialogContent class="border-gray-700 bg-gray-800 text-white sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Add New Transaction</DialogTitle>
						<DialogDescription class="text-gray-400">
							Record a new income or expense transaction
						</DialogDescription>
					</DialogHeader>
					<Tabs bind:value={activeTabValue} class="w-full">
						<TabsList class="grid w-full grid-cols-3 bg-gray-700">
							<TabsTrigger
								value="manual"
								class="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
							>
								Manual
							</TabsTrigger>
							<TabsTrigger
								value="chat"
								class="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
							>
								Chat
							</TabsTrigger>
							<TabsTrigger
								value="ocr"
								class="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
							>
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
										class="border-gray-600 bg-gray-700"
									/>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-2">
										<Label for="amount">Amount</Label>
										<Input
											id="amount"
											bind:value={formAmount}
											type="number"
											step="0.01"
											placeholder="0.00"
											required
											class="border-gray-600 bg-gray-700"
										/>
									</div>
									<div class="space-y-2">
										<Label for="type">Type</Label>
										<select
											bind:value={formType}
											required
											class="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
										>
											<option value="">Select transaction type</option>
											<option value="income">Income</option>
											<option value="expense">Expense</option>
										</select>
									</div>
								</div>
								<div class="space-y-2">
									<div class="flex items-center justify-between">
										<Label for="category">Category (Optional)</Label>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onclick={() => handleNewCategoryClick()}
											disabled={!formType}
											class="h-auto p-0 font-normal text-blue-400 hover:text-blue-300 disabled:cursor-not-allowed disabled:text-gray-500"
										>
											+ New Category
										</Button>
									</div>
									<div class="grid grid-cols-1 gap-2">
										<select
											bind:value={formCategory}
											class="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
										>
											<option value="">No Category</option>
											{#each getAllCategories().filter((cat) => !formType || cat.type === formType) as category}
												<option value={category.id.toString()}>
													{category.name}
													{#if category.id.startsWith('temp_')}
														<span class="text-blue-400"> (New)</span>
													{/if}
												</option>
											{/each}
										</select>
										{#if formCategory}
											{@const selectedCategory = getAllCategories().find(
												(cat) => cat.id.toString() === formCategory
											)}
											{#if selectedCategory}
												<div class="px-1 text-xs text-gray-400">
													Selected: {selectedCategory.name} ({selectedCategory.type})
													{#if selectedCategory.id.startsWith('temp_')}
														<span class="text-blue-400"> - Will be created</span>
													{/if}
												</div>
											{/if}
										{/if}
									</div>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-2">
										<Label for="event">Event (Optional)</Label>
										<Input
											id="event"
											bind:value={formEvent}
											placeholder="e.g., Birthday dinner, Gas for road trip"
											class="border-gray-600 bg-gray-700"
										/>
									</div>
									<div class="space-y-2">
										<Label for="date">Date</Label>
										<Input
											id="date"
											bind:value={formDate}
											type="date"
											required
											class="border-gray-600 bg-gray-700"
										/>
									</div>
								</div>

								<div
									class="flex items-center space-x-2 rounded-lg border border-gray-600 bg-gray-700/50 p-3"
								>
									<Checkbox
										id="isRecurrent"
										bind:checked={formIsRecurrent}
										class="h-5 w-5 border-gray-400 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
									/>
									<Label
										for="isRecurrent"
										class="flex cursor-pointer items-center gap-2 text-sm font-medium text-white"
									>
										<Repeat class="h-4 w-4 text-blue-400" />
										Recurring Transaction (Optional)
									</Label>
								</div>
								<Button
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
								<div
									class="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-600 p-8"
								>
									<div class="text-center">
										<MessageSquare class="mx-auto mb-4 h-12 w-12 text-gray-400" />
										<h3 class="mb-2 text-lg font-medium text-white">Chat Input</h3>
										<p class="mb-4 text-gray-400">Describe your transaction in natural language</p>
										<p class="text-sm text-gray-500">Feature coming soon...</p>
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="ocr">
							<div class="space-y-4">
								{#if !ocrResult}
									<!-- File Upload Section -->
									<div class="space-y-4">
										<!-- File Upload Area -->
										<div
											class="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-600 p-8"
										>
											<div class="text-center">
												<Camera class="mx-auto mb-4 h-12 w-12 text-gray-400" />
												<h3 class="mb-2 text-lg font-medium text-white">Receipt OCR</h3>
												<p class="mb-4 text-gray-400">
													Upload a receipt to automatically extract transaction details
												</p>
												<Button
													onclick={() => fileInputRef?.click()}
													disabled={isProcessingOCR}
													class="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:opacity-50"
												>
													{#if isProcessingOCR}
														<div
															class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"
														></div>
														Processing...
													{:else}
														<Camera class="mr-2 h-4 w-4" />
														Choose Receipt
													{/if}
												</Button>
											</div>
										</div>

										<!-- Hidden file input -->
										<input
											bind:this={fileInputRef}
											type="file"
											accept="image/*"
											class="hidden"
											onchange={handleFileSelected}
										/>

										{#if selectedFile}
											<div class="flex items-center justify-between rounded-lg bg-gray-700 p-3">
												<div class="flex items-center gap-2">
													<Camera class="h-4 w-4 text-green-400" />
													<span class="text-sm text-gray-300">{selectedFile.name}</span>
												</div>
												<Badge variant="secondary" class="bg-gray-600 text-gray-300">
													{(selectedFile.size / 1024 / 1024).toFixed(1)}MB
												</Badge>
											</div>
										{/if}

										{#if ocrError}
											<div class="rounded-lg border border-red-500 bg-red-900/50 p-3">
												<p class="text-sm text-red-300">{ocrError}</p>
											</div>
										{/if}
									</div>
								{:else}
									<!-- OCR Results Preview -->
									<div class="space-y-4">
										<div class="text-center">
											<div
												class="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500"
											>
												<Camera class="h-4 w-4 text-white" />
											</div>
											<h3 class="font-semibold text-green-400">Receipt Processed!</h3>
										</div>

										<div class="space-y-2 rounded-lg bg-gray-700 p-4">
											<h4 class="mb-3 font-mono text-sm font-semibold text-white">
												🧾 OCR Preview:
											</h4>
											<div class="space-y-1 text-sm">
												<div class="flex justify-between">
													<span class="text-gray-400">Description:</span>
													<span class="font-medium text-white">{ocrResult.description}</span>
												</div>
												<div class="flex justify-between">
													<span class="text-gray-400">Amount:</span>
													<span class="font-medium text-white">৳{ocrResult.amount.toFixed(2)}</span>
												</div>
												<div class="flex justify-between">
													<span class="text-gray-400">Type:</span>
													<Badge variant={ocrResult.type === 'expense' ? 'destructive' : 'default'}>
														{ocrResult.type}
													</Badge>
												</div>
												<div class="flex justify-between">
													<span class="text-gray-400">Category:</span>
													<span class="font-medium text-white">{ocrResult.category}</span>
												</div>
												<div class="flex justify-between">
													<span class="text-gray-400">Vendor:</span>
													<span class="font-medium text-white">{ocrResult.vendor}</span>
												</div>
												<div class="flex justify-between">
													<span class="text-gray-400">Date:</span>
													<span class="font-medium text-white"
														>{new Date(ocrResult.date).toLocaleDateString()}</span
													>
												</div>
											</div>
										</div>

										<div class="flex gap-2">
											<Button
												variant="outline"
												class="flex-1 border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
												onclick={handleOCREdit}
											>
												<Edit class="mr-2 h-4 w-4" />
												Edit
											</Button>
											<Button
												class="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
												onclick={handleOCRConfirm}
											>
												<Camera class="mr-2 h-4 w-4" />
												Confirm & Add
											</Button>
										</div>
									</div>
								{/if}
							</div>
						</TabsContent>
					</Tabs>
				</DialogContent>
			</Dialog>
		</div>

		<!-- New Category Dialog -->
		<Dialog bind:open={isNewCategoryOpen}>
			<DialogContent class="border-gray-700 bg-gray-800">
				<DialogHeader>
					<DialogTitle class="text-white">Create New Category</DialogTitle>
					<DialogDescription class="text-gray-400">
						Add a new category for your transactions
					</DialogDescription>
				</DialogHeader>
				<form onsubmit={handleCreateCategory} class="space-y-4">
					<div class="space-y-2">
						<Label for="categoryName" class="text-white">Category Name</Label>
						<Input
							id="categoryName"
							bind:value={newCategoryName}
							placeholder="Enter category name"
							required
							class="border-gray-600 bg-gray-700"
						/>
					</div>
					<div class="space-y-2">
						<Label for="categoryType" class="text-white">Category Type</Label>
						<div
							class="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 capitalize text-white"
						>
							{newCategoryType}
						</div>
						<p class="text-xs text-gray-400">
							Type is automatically set based on your transaction type
						</p>
					</div>
					<div class="flex gap-2">
						<Button
							type="button"
							variant="outline"
							onclick={() => (isNewCategoryOpen = false)}
							class="flex-1 border-black bg-black font-bold text-red-500 hover:bg-gray-900"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							class="flex-1 bg-gradient-to-r from-blue-500 to-green-500 font-bold text-white hover:from-blue-600 hover:to-green-600"
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
				<TabsList class="grid w-full grid-cols-2 gap-2 bg-transparent p-0">
					<TabsTrigger
						value="expense"
						class="rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-300 transition-all duration-200 hover:bg-gray-700 data-[state=active]:border-red-500 data-[state=active]:bg-red-900 data-[state=active]:text-white"
					>
						<ArrowDownIcon class="mr-2 h-4 w-4" />
						Expenses
					</TabsTrigger>
					<TabsTrigger
						value="income"
						class="rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-300 transition-all duration-200 hover:bg-gray-700 data-[state=active]:border-green-500 data-[state=active]:bg-green-900 data-[state=active]:text-white"
					>
						<ArrowUpIcon class="mr-2 h-4 w-4" />
						Income
					</TabsTrigger>
				</TabsList>

				<TabsContent value="expense" class="mt-6 space-y-4">
					<!-- Filters and Search -->
					<div class="flex flex-col gap-4 sm:flex-row">
						<div class="relative flex-1">
							<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<Input
								placeholder="Search expenses..."
								bind:value={searchTerm}
								class="border-gray-700 bg-gray-800 pl-10 text-white"
							/>
						</div>
						<div class="flex gap-2">
							<select
								bind:value={filterCategory}
								class="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white sm:w-[180px]"
							>
								<option value="all">All Categories</option>
								<!-- <option value="none">No Category</option> -->
								{#each categories.filter((cat) => cat.type === 'expense') as category}
									<option value={category.id.toString()}>{category.name}</option>
								{/each}
							</select>
							<select
								bind:value={sortBy}
								class="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white sm:w-[140px]"
							>
								<option value="date">Sort by Date</option>
								<option value="amount">Sort by Amount</option>
							</select>
						</div>
					</div>

					<!-- Expenses Transactions List -->
					<Card class="border-gray-800 bg-gray-900">
						<CardHeader>
							<CardTitle class="flex items-center gap-2 text-white">
								<ArrowDownIcon class="h-5 w-5 text-red-400" />
								Expense Transactions
							</CardTitle>
							<CardDescription class="flex items-center justify-between text-gray-400">
								<span>
									{paginatedData.totalCount} expense transaction{paginatedData.totalCount !== 1
										? 's'
										: ''} found
									{sortBy === 'date' ? ' (sorted by date)' : ' (sorted by amount)'}
								</span>
								<span class="text-sm">
									Page {currentPage} of {paginatedData.totalPages}
								</span>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div class="space-y-4">
								{#if currentTransactions.length === 0}
									<div class="py-8 text-center text-gray-500">
										<p>No expense transactions found</p>
									</div>
								{:else}
									{#each currentTransactions as transaction}
										<div
											class="flex items-center justify-between rounded-lg border border-gray-800 p-4 transition-colors hover:bg-gray-800/50"
										>
											<div class="flex items-center space-x-3">
												<div
													class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400"
												>
													<ArrowDownIcon class="h-5 w-5" />
												</div>
												<div>
													<div class="flex items-center gap-2">
														<p class="font-medium text-white">{transaction.description}</p>
														{#if transaction.recurrence}
															<Badge
																variant="outline"
																class="border-blue-500 text-xs text-blue-400"
															>
																<Repeat class="mr-1 h-3 w-3" />
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
												<p class="font-semibold text-red-400">
													-${Math.abs(transaction.amount).toFixed(2)}
												</p>
												<Badge variant="secondary" class="bg-gray-800 text-xs text-gray-300">
													{getCategoryDisplay(transaction.category_id)}
												</Badge>
												<div class="mt-2 flex gap-2">
													<Button
														variant="outline"
														size="sm"
														onclick={() => handleViewDetails(transaction)}
														class="flex-1 border-2 border-blue-500 bg-gray-900 font-semibold text-blue-400 shadow-lg hover:bg-blue-500/20 hover:text-blue-300"
													>
														View Details
													</Button>
													<Button
														variant="outline"
														size="sm"
														onclick={() => handleEditTransaction(transaction)}
														class="flex-1 border-2 border-green-500 bg-gray-900 font-semibold text-green-400 shadow-lg hover:bg-green-500/20 hover:text-green-300"
													>
														<Edit class="mr-1 h-4 w-4" />
														Edit
													</Button>
													<Button
														variant="outline"
														size="sm"
														onclick={() => handleDeleteTransaction(transaction)}
														class="flex-1 border-2 border-red-500 bg-gray-900 font-semibold text-red-400 shadow-lg hover:bg-red-500/20 hover:text-red-300"
														disabled={isDeleting}
													>
														<Trash2 class="mr-1 h-4 w-4" />
														Delete
													</Button>
												</div>
											</div>
										</div>
									{/each}
								{/if}
							</div>
							{#if paginatedData.totalPages > 1}
								<div class="flex items-center justify-between border-t border-gray-800 pt-4">
									<div class="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onclick={() => (currentPage = Math.max(1, currentPage - 1))}
											disabled={currentPage === 1}
											class="border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
										>
											Previous
										</Button>
										<Button
											variant="outline"
											size="sm"
											onclick={() =>
												(currentPage = Math.min(paginatedData.totalPages, currentPage + 1))}
											disabled={currentPage === paginatedData.totalPages}
											class="border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
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
												onclick={() => (currentPage = pageNum)}
												class={isActive
													? 'border-blue-500 bg-blue-600 text-white hover:bg-blue-700'
													: 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'}
											>
												{pageNum}
											</Button>
										{/each}
										{#if paginatedData.totalPages > 5}
											<span class="px-2 text-gray-400">...</span>
											<Button
												variant="outline"
												size="sm"
												onclick={() => (currentPage = paginatedData.totalPages)}
												class={currentPage === paginatedData.totalPages
													? 'border-blue-500 bg-blue-600 text-white hover:bg-blue-700'
													: 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'}
											>
												{paginatedData.totalPages}
											</Button>
										{/if}
									</div>
									<div class="text-sm text-gray-400">
										Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(
											currentPage * itemsPerPage,
											paginatedData.totalCount
										)} of {paginatedData.totalCount}
									</div>
								</div>
							{/if}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="income" class="mt-6 space-y-4">
					<!-- Filters and Search -->
					<div class="flex flex-col gap-4 sm:flex-row">
						<div class="relative flex-1">
							<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<Input
								placeholder="Search income..."
								bind:value={searchTerm}
								class="border-gray-700 bg-gray-800 pl-10 text-white"
							/>
						</div>
						<div class="flex gap-2">
							<select
								bind:value={filterCategory}
								class="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white sm:w-[180px]"
							>
								<option value="all">All Categories</option>
								<!-- <option value="none">No Category</option> -->
								{#each categories.filter((cat) => cat.type === 'income') as category}
									<option value={category.id.toString()}>{category.name}</option>
								{/each}
							</select>
							<select
								bind:value={sortBy}
								class="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white sm:w-[140px]"
							>
								<option value="date">Sort by Date</option>
								<option value="amount">Sort by Amount</option>
							</select>
						</div>
					</div>

					<!-- Income Transactions List -->
					<Card class="border-gray-800 bg-gray-900">
						<CardHeader>
							<CardTitle class="flex items-center gap-2 text-white">
								<ArrowUpIcon class="h-5 w-5 text-green-400" />
								Income Transactions
							</CardTitle>
							<CardDescription class="flex items-center justify-between text-gray-400">
								<span>
									{paginatedData.totalCount} income transaction{paginatedData.totalCount !== 1
										? 's'
										: ''} found
									{sortBy === 'date' ? ' (sorted by date)' : ' (sorted by amount)'}
								</span>
								<span class="text-sm">
									Page {currentPage} of {paginatedData.totalPages}
								</span>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div class="space-y-4">
								{#if currentTransactions.length === 0}
									<div class="py-8 text-center text-gray-500">
										<p>No income transactions found</p>
									</div>
								{:else}
									{#each currentTransactions as transaction}
										<div
											class="flex items-center justify-between rounded-lg border border-gray-800 p-4 transition-colors hover:bg-gray-800/50"
										>
											<div class="flex items-center space-x-3">
												<div
													class="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-400"
												>
													<ArrowUpIcon class="h-5 w-5" />
												</div>
												<div>
													<div class="flex items-center gap-2">
														<p class="font-medium text-white">{transaction.description}</p>
														{#if transaction.recurrence}
															<Badge
																variant="outline"
																class="border-blue-500 text-xs text-blue-400"
															>
																<Repeat class="mr-1 h-3 w-3" />
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
												<p class="font-semibold text-green-400">
													+${Math.abs(transaction.amount).toFixed(2)}
												</p>
												<Badge variant="secondary" class="bg-gray-800 text-xs text-gray-300">
													{getCategoryDisplay(transaction.category_id)}
												</Badge>
												<div class="mt-2 flex gap-2">
													<Button
														variant="outline"
														size="sm"
														onclick={() => handleViewDetails(transaction)}
														class="flex-1 border-2 border-blue-500 bg-gray-900 font-semibold text-blue-400 shadow-lg hover:bg-blue-500/20 hover:text-blue-300"
													>
														View Details
													</Button>
													<Button
														variant="outline"
														size="sm"
														onclick={() => handleEditTransaction(transaction)}
														class="flex-1 border-2 border-green-500 bg-gray-900 font-semibold text-green-400 shadow-lg hover:bg-green-500/20 hover:text-green-300"
													>
														<Edit class="mr-1 h-4 w-4" />
														Edit
													</Button>
													<Button
														variant="outline"
														size="sm"
														onclick={() => handleDeleteTransaction(transaction)}
														class="flex-1 border-2 border-red-500 bg-gray-900 font-semibold text-red-400 shadow-lg hover:bg-red-500/20 hover:text-red-300"
														disabled={isDeleting}
													>
														<Trash2 class="mr-1 h-4 w-4" />
														Delete
													</Button>
												</div>
											</div>
										</div>
									{/each}
								{/if}
							</div>
							{#if paginatedData.totalPages > 1}
								<div class="flex items-center justify-between border-t border-gray-800 pt-4">
									<div class="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onclick={() => (currentPage = Math.max(1, currentPage - 1))}
											disabled={currentPage === 1}
											class="border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
										>
											Previous
										</Button>
										<Button
											variant="outline"
											size="sm"
											onclick={() =>
												(currentPage = Math.min(paginatedData.totalPages, currentPage + 1))}
											disabled={currentPage === paginatedData.totalPages}
											class="border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
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
												onclick={() => (currentPage = pageNum)}
												class={isActive
													? 'border-blue-500 bg-blue-600 text-white hover:bg-blue-700'
													: 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'}
											>
												{pageNum}
											</Button>
										{/each}
										{#if paginatedData.totalPages > 5}
											<span class="px-2 text-gray-400">...</span>
											<Button
												variant="outline"
												size="sm"
												onclick={() => (currentPage = paginatedData.totalPages)}
												class={currentPage === paginatedData.totalPages
													? 'border-blue-500 bg-blue-600 text-white hover:bg-blue-700'
													: 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'}
											>
												{paginatedData.totalPages}
											</Button>
										{/if}
									</div>
									<div class="text-sm text-gray-400">
										Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(
											currentPage * itemsPerPage,
											paginatedData.totalCount
										)} of {paginatedData.totalCount}
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
			<DialogContent class="border-gray-700 bg-gray-800 text-white sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle class="flex items-center gap-2">
						{#if selectedTransactionDetails?.type === 'income'}
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
								<p
									class="font-medium {selectedTransactionDetails.type === 'income'
										? 'text-green-400'
										: 'text-red-400'}"
								>
									{selectedTransactionDetails.type === 'income' ? '+' : '-'}${Math.abs(
										selectedTransactionDetails.amount
									).toFixed(2)}
								</p>
							</div>
							<div>
								<p class="text-sm text-gray-400">Category</p>
								{#if selectedTransactionDetails.category_id}
									{@const category = getCategoryById(selectedTransactionDetails.category_id)}
									{#if category}
										<div class="space-y-1">
											<Badge variant="secondary" class="bg-gray-700 text-gray-300">
												{category.name}
											</Badge>
											<p class="text-xs capitalize text-gray-500">
												{category.type}
											</p>
										</div>
									{:else}
										<Badge variant="secondary" class="bg-gray-700 text-gray-300">No Category</Badge>
									{/if}
								{:else}
									<Badge variant="secondary" class="bg-gray-700 text-gray-300">No Category</Badge>
								{/if}
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
						{#if selectedTransactionDetails.recurrence}
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

	<!-- Edit Transaction Dialog -->
	{#if isEditOpen && editingTransaction}
		<Dialog bind:open={isEditOpen}>
			<DialogContent class="mx-auto max-w-md border-gray-800 bg-gray-900 text-white">
				<DialogHeader>
					<DialogTitle class="text-white">Edit Transaction</DialogTitle>
					<DialogDescription class="text-gray-400">
						Update the transaction details below.
					</DialogDescription>
				</DialogHeader>

				<div class="space-y-4">
					<!-- Description -->
					<div>
						<Label for="edit-description" class="text-white">Description</Label>
						<Input
							id="edit-description"
							bind:value={editDescription}
							placeholder="Transaction description"
							class="border-gray-700 bg-gray-800 text-white"
						/>
					</div>

					<!-- Amount -->
					<div>
						<Label for="edit-amount" class="text-white">Amount</Label>
						<Input
							id="edit-amount"
							type="number"
							step="0.01"
							bind:value={editAmount}
							placeholder="0.00"
							class="border-gray-700 bg-gray-800 text-white"
						/>
					</div>

					<!-- Type -->
					<div>
						<Label for="edit-type" class="text-white">Type</Label>
						<select
							id="edit-type"
							bind:value={editType}
							class="w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-white"
						>
							<option value="">Select type</option>
							<option value="income">Income</option>
							<option value="expense">Expense</option>
						</select>
					</div>

					<!-- Category -->
					<div>
						<Label for="edit-category" class="text-white">Category</Label>
						<select
							id="edit-category"
							bind:value={editCategory}
							class="w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-white"
						>
							<option value="">Select category</option>
							{#each getFilteredCategories(editType) as category}
								<option value={category.id}>{category.name}</option>
							{/each}
						</select>
					</div>

					<!-- Date -->
					<div>
						<Label for="edit-date" class="text-white">Date</Label>
						<Input
							id="edit-date"
							type="date"
							bind:value={editDate}
							class="border-gray-700 bg-gray-800 text-white"
						/>
					</div>

					<!-- Event (optional) -->
					<div>
						<Label for="edit-event" class="text-white">Event (Optional)</Label>
						<Input
							id="edit-event"
							bind:value={editEvent}
							placeholder="Related event"
							class="border-gray-700 bg-gray-800 text-white"
						/>
					</div>

					<!-- Recurring -->
					<div class="flex items-center space-x-2">
						<Checkbox
							id="edit-recurring"
							bind:checked={editIsRecurrent}
							class="border-gray-600 data-[state=checked]:bg-blue-600"
						/>
						<Label for="edit-recurring" class="text-white">Recurring transaction</Label>
					</div>
					<!-- Action Buttons -->
					<div class="flex gap-2 pt-4">
						<Button
							variant="outline"
							onclick={() => (isEditOpen = false)}
							class="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
							disabled={isSaving}
						>
							Cancel
						</Button>
						<Button
							onclick={handleUpdateTransaction}
							class="flex-1 bg-gradient-to-r from-green-500 to-green-600 font-semibold text-white shadow-lg hover:from-green-600 hover:to-green-700"
							disabled={isSaving}
						>
							{isSaving ? 'Updating...' : 'Update Transaction'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	{/if}
</div>
