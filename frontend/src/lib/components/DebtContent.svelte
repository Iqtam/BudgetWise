<script lang="ts">
	import { 
		CreditCard, 
		DollarSign, 
		TrendingDown, 
		Wallet, 
		Plus,
		Edit,
		Trash2
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Progress } from '$lib/components/ui/progress';
	import { 
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle,
		DialogTrigger 
	} from '$lib/components/ui/dialog';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import { debtService, type Debt } from '$lib/services/debts';
	import { firebaseUser, loading as authLoading } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	// State variables
	let debts = $state<Debt[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let successMessage = $state<string | null>(null);
	let isAddDebtOpen = $state(false);
	let isPaymentOpen = $state(false);
	let isEditDialogOpen = $state(false);
	let selectedDebt = $state<Debt | null>(null);
	let editingDebt = $state<Debt | null>(null);
	let currentPage = $state(1);
	let isSaving = $state(false);
	let isDeleting = $state(false);
	const itemsPerPage = 10;

	// Form fields
	let formDescription = $state("");
	let formType = $state<'bank' | 'personal'>('bank');
	let formAmount = $state("");
	let formInterestRate = $state("");
	let formTakenFrom = $state("");
	let formStartDate = $state(new Date().toISOString().split("T")[0]);
	let formExpirationDate = $state("");

	// Edit form fields
	let editFormDescription = $state("");
	let editFormType = $state<'bank' | 'personal'>('bank');
	let editFormAmount = $state("");
	let editFormInterestRate = $state("");
	let editFormTakenFrom = $state("");
	let editFormStartDate = $state("");
	let editFormExpirationDate = $state("");

	// Wait for authentication before loading data
	$effect(() => {
		if (!$authLoading && $firebaseUser) {
			loadData();
		}
	});

	// Function to load debts from API
	async function loadData() {
		isLoading = true;
		error = null;
		try {
			const debtData = await debtService.getAllDebts();
			debts = debtData;
		} catch (err) {
			console.error('Error loading data:', err);
			error = err instanceof Error ? err.message : 'Failed to load data';
		} finally {
			isLoading = false;
		}
	}

	$effect(() => {
		currentPage = 1;
	});

	const getPaginatedDebts = () => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		const paginatedDebts = debts.slice(startIndex, endIndex);

		return {
			debts: paginatedDebts,
			totalCount: debts.length,
			totalPages: Math.ceil(debts.length / itemsPerPage),
			startIndex: startIndex + 1,
			endIndex: Math.min(endIndex, debts.length),
		};
	};

	const paginatedData = $derived(getPaginatedDebts());
	const totalDebt = $derived(debts.reduce((sum, debt) => sum + debt.amount, 0));
	const totalMinimumPayment = $derived(debts.reduce((sum, debt) => sum + (debt.amount * 0.02), 0)); // Estimate 2% minimum payment
	const highestInterestRate = $derived(debts.length > 0 ? Math.max(...debts.map(debt => debt.interest_rate)) : 0);
	const highestInterestDebt = $derived(debts.find(debt => debt.interest_rate === highestInterestRate));

	async function handleAddDebt(event: Event) {
		event.preventDefault();
		
		if (!formDescription || !formAmount || !formInterestRate || !formTakenFrom || !formStartDate || !formExpirationDate) {
			error = 'Please fill in all required fields';
			return;
		}

		isSaving = true;
		error = null;
		try {
			await debtService.createDebt({
				description: formDescription,
				type: formType,
				amount: parseFloat(formAmount),
				interest_rate: parseFloat(formInterestRate),
				taken_from: formTakenFrom,
				start_date: formStartDate,
				expiration_date: formExpirationDate
			});

			// Reload data to get the new debt
			await loadData();
			
			isAddDebtOpen = false;
			
			// Reset form
			formDescription = "";
			formType = 'bank';
			formAmount = "";
			formInterestRate = "";
			formTakenFrom = "";
			formStartDate = new Date().toISOString().split("T")[0];
			formExpirationDate = "";

			// Show success message
			successMessage = 'Debt added successfully';
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error creating debt:', err);
			error = err instanceof Error ? err.message : 'Failed to create debt';
		} finally {
			isSaving = false;
		}
	}

	async function handlePayment(event: Event) {
		event.preventDefault();
		
		if (!selectedDebt) return;
		
		const formData = new FormData(event.target as HTMLFormElement);
		const paymentAmount = Number.parseFloat(formData.get("amount") as string);

		if (isNaN(paymentAmount) || paymentAmount <= 0) {
			error = 'Please enter a valid payment amount';
			return;
		}

		isSaving = true;
		error = null;
		try {
			const newAmount = Math.max(0, selectedDebt.amount - paymentAmount);
			
			await debtService.updateDebt(selectedDebt.id, {
				amount: newAmount
			});

			// Reload data to get updated amounts
			await loadData();
			
			isPaymentOpen = false;
			selectedDebt = null;
			
			successMessage = `Payment of $${paymentAmount.toLocaleString()} recorded successfully`;
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error recording payment:', err);
			error = err instanceof Error ? err.message : 'Failed to record payment';
		} finally {
			isSaving = false;
		}
	}

	function handleEditDebt(debt: Debt) {
		editingDebt = debt;
		editFormDescription = debt.description;
		editFormType = debt.type;
		editFormAmount = debt.amount.toString();
		editFormInterestRate = debt.interest_rate.toString();
		editFormTakenFrom = debt.taken_from;
		editFormStartDate = debt.start_date;
		editFormExpirationDate = debt.expiration_date;
		isEditDialogOpen = true;
	}

	async function handleUpdateDebt(event: Event) {
		event.preventDefault();
		
		if (!editingDebt || !editFormDescription || !editFormAmount || !editFormInterestRate || !editFormTakenFrom || !editFormStartDate || !editFormExpirationDate) {
			error = 'Please fill in all required fields';
			return;
		}

		isSaving = true;
		error = null;
		try {
			await debtService.updateDebt(editingDebt.id, {
				description: editFormDescription,
				type: editFormType,
				amount: parseFloat(editFormAmount),
				interest_rate: parseFloat(editFormInterestRate),
				taken_from: editFormTakenFrom,
				start_date: editFormStartDate,
				expiration_date: editFormExpirationDate
			});

			// Reload data to get the updated debt
			await loadData();
			
			isEditDialogOpen = false;
			editingDebt = null;
			
			successMessage = 'Debt updated successfully';
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error updating debt:', err);
			error = err instanceof Error ? err.message : 'Failed to update debt';
		} finally {
			isSaving = false;
		}
	}

	async function handleDeleteDebt(debt: Debt) {
		if (!confirm(`Are you sure you want to delete the debt "${debt.description}"?`)) {
			return;
		}

		isDeleting = true;
		error = null;
		try {
			await debtService.deleteDebt(debt.id);
			
			// Reload data to remove the deleted debt
			await loadData();
			
			successMessage = 'Debt deleted successfully';
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error deleting debt:', err);
			error = err instanceof Error ? err.message : 'Failed to delete debt';
		} finally {
			isDeleting = false;
		}
	}

	function setMinimumPayment(debt: Debt) {
		const minimumPayment = debt.amount * 0.02; // 2% minimum payment estimate
		const input = document.getElementById("amount") as HTMLInputElement;
		if (input) input.value = minimumPayment.toFixed(2);
	}

	function setPayoffAmount(debt: Debt) {
		const input = document.getElementById("amount") as HTMLInputElement;
		if (input) input.value = debt.amount.toString();
	}

	function getDebtStatus(amount: number, originalAmount: number) {
		if (originalAmount <= 0) return { status: "No Debt", color: "text-gray-400", bgColor: "bg-gray-500/20" };
		const percentage = ((originalAmount - amount) / originalAmount) * 100;
		if (percentage >= 100) return { status: "Paid Off", color: "text-green-400", bgColor: "bg-green-500/20" };
		if (percentage >= 75) return { status: "Almost Done", color: "text-yellow-400", bgColor: "bg-yellow-500/20" };
		if (percentage >= 25) return { status: "In Progress", color: "text-blue-400", bgColor: "bg-blue-500/20" };
		return { status: "Getting Started", color: "text-red-400", bgColor: "bg-red-500/20" };
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
			<div class="text-gray-400">Loading debts...</div>
		</div>
	{:else}
	<!-- Header with Add Button -->
	<div class="flex items-center justify-between mb-6">
		<div>
			<h2 class="text-2xl font-bold text-white">Debt Management</h2>
			<p class="text-gray-400">Track and manage your debt payments</p>
		</div>
		
		<Dialog bind:open={isAddDebtOpen}>
			<DialogTrigger>
				<Button class="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
					<Plus class="h-4 w-4 mr-2" />
					Add Debt
				</Button>
			</DialogTrigger>
			<DialogContent class="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
				<DialogHeader>
					<DialogTitle>Add New Debt</DialogTitle>
					<DialogDescription class="text-gray-400">Record a new debt to track and manage</DialogDescription>
				</DialogHeader>
				<form onsubmit={handleAddDebt} class="space-y-4">
					<div class="space-y-2">
						<Label for="description">Description</Label>
						<Input
							id="description"
							bind:value={formDescription}
							placeholder="e.g., Credit Card, Student Loan"
							required
							class="bg-gray-700 border-gray-600"
						/>
					</div>

					<div class="space-y-2">
						<Label for="type">Type</Label>
						<select bind:value={formType} required class="bg-gray-700 border-gray-600 rounded px-3 py-2 text-white w-full">
							<option value="bank">Bank</option>
							<option value="personal">Personal</option>
						</select>
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
						<Label for="interestRate">Interest Rate (%)</Label>
						<Input
							id="interestRate"
							bind:value={formInterestRate}
							type="number"
							step="0.01"
							placeholder="0.00"
							required
							class="bg-gray-700 border-gray-600"
						/>
					</div>

					<div class="space-y-2">
						<Label for="takenFrom">Taken From</Label>
						<Input
							id="takenFrom"
							bind:value={formTakenFrom}
							placeholder="e.g., Chase Bank, John Doe"
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
						<Label for="expirationDate">Expiration Date</Label>
						<Input
							id="expirationDate"
							bind:value={formExpirationDate}
							type="date"
							required
							class="bg-gray-700 border-gray-600"
						/>
					</div>

					<Button
						type="submit"
						disabled={isSaving}
						class="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
					>
						{isSaving ? 'Adding...' : 'Add Debt'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	</div>

	<!-- Edit Debt Dialog -->
	<Dialog bind:open={isEditDialogOpen}>
		<DialogContent class="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
			<DialogHeader>
				<DialogTitle>Edit Debt</DialogTitle>
				<DialogDescription class="text-gray-400">Update your debt information</DialogDescription>
			</DialogHeader>
			<form onsubmit={handleUpdateDebt} class="space-y-4">
				<div class="space-y-2">
					<Label for="editDescription">Description</Label>
					<Input
						id="editDescription"
						bind:value={editFormDescription}
						placeholder="e.g., Credit Card, Student Loan"
						required
						class="bg-gray-700 border-gray-600"
					/>
				</div>

				<div class="space-y-2">
					<Label for="editType">Type</Label>
					<select bind:value={editFormType} required class="bg-gray-700 border-gray-600 rounded px-3 py-2 text-white w-full">
						<option value="bank">Bank</option>
						<option value="personal">Personal</option>
					</select>
				</div>

				<div class="space-y-2">
					<Label for="editAmount">Amount</Label>
					<Input
						id="editAmount"
						bind:value={editFormAmount}
						type="number"
						step="0.01"
						placeholder="0.00"
						required
						class="bg-gray-700 border-gray-600"
					/>
				</div>

				<div class="space-y-2">
					<Label for="editInterestRate">Interest Rate (%)</Label>
					<Input
						id="editInterestRate"
						bind:value={editFormInterestRate}
						type="number"
						step="0.01"
						placeholder="0.00"
						required
						class="bg-gray-700 border-gray-600"
					/>
				</div>

				<div class="space-y-2">
					<Label for="editTakenFrom">Taken From</Label>
					<Input
						id="editTakenFrom"
						bind:value={editFormTakenFrom}
						placeholder="e.g., Chase Bank, John Doe"
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
					<Label for="editExpirationDate">Expiration Date</Label>
					<Input
						id="editExpirationDate"
						bind:value={editFormExpirationDate}
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
						{isSaving ? 'Updating...' : 'Update Debt'}
					</Button>
				</div>
			</form>
		</DialogContent>
	</Dialog>

	<!-- Debt Overview -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-white">Total Debt</CardTitle>
				<Wallet class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-red-600">${totalDebt.toLocaleString()}</div>
				<p class="text-xs text-gray-400">{debts.length} active debts</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-white">Monthly Payments</CardTitle>
				<DollarSign class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">${totalMinimumPayment.toFixed(0)}</div>
				<p class="text-xs text-gray-400">Minimum required</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-white">Highest Interest</CardTitle>
				<TrendingDown class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">{highestInterestRate.toFixed(1)}%</div>
				<p class="text-xs text-gray-400">{highestInterestDebt?.description || 'N/A'}</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-white">Debt-Free Date</CardTitle>
				<CreditCard class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">2029</div>
				<p class="text-xs text-gray-400">At current rate</p>
			</CardContent>
		</Card>
	</div>

	<!-- Debt List -->
	<Card class="bg-gray-900 border-gray-800">
		<CardHeader>
			<CardTitle class="text-white">Your Debts</CardTitle>
			<div class="flex items-center justify-between text-gray-400">
				<span>
					Showing {paginatedData.startIndex}-{paginatedData.endIndex} of {paginatedData.totalCount} debts
				</span>
				<span class="text-sm">
					Page {currentPage} of {paginatedData.totalPages}
				</span>
			</div>
		</CardHeader>
		<CardContent>
			<div class="space-y-6">
				{#each paginatedData.debts as debt (debt.id)}
					{@const minimumPayment = debt.amount * 0.02}
					{@const debtStatus = getDebtStatus(debt.amount, debt.amount)}
					
					<div class="border border-gray-700 rounded-lg p-4 space-y-4 bg-gray-800">
						<div class="flex items-center justify-between">
							<div>
								<div class="flex items-center gap-2">
									<h3 class="font-semibold text-white">{debt.description}</h3>
									<Badge variant={debt.type === "bank" ? "default" : "secondary"}>{debt.type}</Badge>
									<Badge class="{debtStatus.bgColor} {debtStatus.color} border-0">
										{debtStatus.status}
									</Badge>
								</div>
								<p class="text-sm text-gray-400">
									{debt.interest_rate}% APR • Due: {new Date(debt.expiration_date).toLocaleDateString()}
								</p>
								<p class="text-xs text-gray-500">From: {debt.taken_from}</p>
							</div>
							<div class="text-right">
								<p class="text-lg font-bold text-white">${debt.amount.toLocaleString()}</p>
								<Badge variant="secondary">Min: ${minimumPayment.toFixed(0)}</Badge>
								<div class="mt-2 flex gap-2">
									<Button 
										variant="outline" 
										size="sm" 
										onclick={() => {
											selectedDebt = debt;
											isPaymentOpen = true;
										}}
										class="bg-gray-900 border-2 border-blue-500 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 font-semibold shadow-lg flex-1"
									>
										Make Payment
									</Button>
									<Button 
										variant="outline" 
										size="sm" 
										onclick={() => handleEditDebt(debt)}
										class="bg-gray-900 border-2 border-green-500 text-green-400 hover:bg-green-500/20 hover:text-green-300 font-semibold shadow-lg flex-1"
									>
										<Edit class="h-4 w-4 mr-1" />
										Edit
									</Button>
									<Button 
										variant="outline" 
										size="sm" 
										onclick={() => handleDeleteDebt(debt)}
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
							<div class="flex justify-between text-sm text-gray-300">
								<span>Remaining Balance</span>
								<span>${debt.amount.toLocaleString()}</span>
							</div>
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

	<!-- Make Payment Dialog -->
	<Dialog bind:open={isPaymentOpen}>
		<DialogContent class="bg-gray-800 border-gray-700 text-white">
			<DialogHeader>
				<DialogTitle>Make Payment - {selectedDebt?.description}</DialogTitle>
				<DialogDescription class="text-gray-400">
					{#if selectedDebt}
						Current balance: ${selectedDebt.amount.toLocaleString()}
					{/if}
				</DialogDescription>
			</DialogHeader>
			<form onsubmit={handlePayment} class="space-y-4">
				<div class="space-y-2">
					<Label for="amount">Payment Amount</Label>
					<Input
						id="amount"
						name="amount"
						type="number"
						step="0.01"
						placeholder={selectedDebt ? (selectedDebt.amount * 0.02).toFixed(2) : "0.00"}
						min={0}
						max={selectedDebt?.amount}
						required
						class="bg-gray-700 border-gray-600"
					/>
				</div>
				<div class="flex gap-2">
					{#if selectedDebt}
						<Button
							type="button"
							variant="outline"
							onclick={() => setMinimumPayment(selectedDebt)}
							class="border-gray-600 text-gray-300 hover:bg-gray-700"
						>
							Minimum (${(selectedDebt.amount * 0.02).toFixed(0)})
						</Button>
						<Button
							type="button"
							variant="outline"
							onclick={() => setPayoffAmount(selectedDebt)}
							class="border-gray-600 text-gray-300 hover:bg-gray-700"
						>
							Pay Off (${selectedDebt.amount.toLocaleString()})
						</Button>
					{/if}
				</div>
				<div class="flex gap-2">
					<Button
						type="button"
						variant="outline"
						onclick={() => {
							isPaymentOpen = false;
							selectedDebt = null;
						}}
						class="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
					>
						Cancel
					</Button>
					<Button 
						type="submit" 
						disabled={isSaving}
						class="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
					>
						{isSaving ? 'Recording...' : 'Record Payment'}
					</Button>
				</div>
			</form>
		</DialogContent>
	</Dialog>

	<!-- Debt Payoff Strategy -->
	<Card class="bg-gray-900 border-gray-800">
		<CardHeader>
			<CardTitle class="text-white">Payoff Strategy</CardTitle>
			<div class="text-gray-400">AI-recommended debt payoff plan</div>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<div class="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
					<h4 class="font-semibold text-blue-300">Debt Avalanche Method Recommended</h4>
					<p class="text-sm text-blue-400 mt-1">
						{#if highestInterestDebt}
							Focus on paying off your {highestInterestDebt.description} first ({highestInterestRate.toFixed(1)}% interest) to save the most money on interest.
						{:else}
							Create some debts to see personalized recommendations.
						{/if}
					</p>
				</div>

				{#if debts.length > 0}
					<div class="space-y-3">
						<h4 class="font-medium text-white">Suggested Payment Order:</h4>
						<div class="space-y-2">
							{#each debts.sort((a, b) => b.interest_rate - a.interest_rate).slice(0, 3) as debt, index}
								<div class="flex items-center justify-between p-3 border border-gray-700 rounded bg-gray-800">
									<div>
										<span class="font-medium text-white">{index + 1}. {debt.description}</span>
										<p class="text-sm text-gray-400">{debt.interest_rate}% APR - {index === 0 ? 'Pay extra here first' : 'Pay minimum for now'}</p>
									</div>
									<Badge variant={index === 0 ? "destructive" : index === 1 ? "destructive" : "secondary"}>
										{index === 0 ? 'High Priority' : index === 1 ? 'High Priority' : 'Medium Priority'}
									</Badge>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>
	{/if}
</div> 