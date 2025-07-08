<script lang="ts">
	import { 
		CreditCard, 
		DollarSign, 
		TrendingDown, 
		Wallet, 
		Plus,
		Edit,
		Trash2,
		Calendar
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
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
	import { balanceService, type Balance } from '$lib/services/balance';
	import { firebaseUser, loading as authLoading } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	// State variables
	let debts = $state<Debt[]>([]);
	let balance = $state<Balance | null>(null);
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
	let deletingDebtId = $state<string | null>(null);
	const itemsPerPage = 10;

	// Separate error states for dialogs
	let createDebtError = $state<string | null>(null);
	let editDebtError = $state<string | null>(null);

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
			const [debtData, balanceData] = await Promise.all([
				debtService.getAllDebts(),
				balanceService.getBalance()
			]);
			debts = debtData;
			balance = balanceData;
		} catch (err) {
			console.error('Error loading data:', err);
			error = err instanceof Error ? err.message : 'Failed to load data';
		} finally {
			isLoading = false;
		}
	}

	// Reset current page when debts change
	$effect(() => {
		if (debts.length > 0) {
			currentPage = 1;
		}
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
	const totalDebtWithInterest = $derived(debts.filter(debt => !debt.is_fully_paid).reduce((sum, debt) => sum + (parseFloat(debt.amount) || 0), 0));
	const earliestDeadline = $derived(
		debts.length === 0 ? 'No debts' : 
		(() => {
			// Filter out fully paid debts
			const activeDebts = debts.filter(debt => !debt.is_fully_paid);
			
			if (activeDebts.length === 0) {
				return 'All debts paid';
			}
			
			const sortedDebts = [...activeDebts]
				.sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime());
			
			const earliestDebt = sortedDebts[0];
			return {
				description: earliestDebt.description,
				date: new Date(earliestDebt.expiration_date).toLocaleDateString(),
				formatted: `${earliestDebt.description} - ${new Date(earliestDebt.expiration_date).toLocaleDateString()}`
			};
		})()
	);

	// Get debt insights for alerts and recommendations
	function getDebtInsights() {
		if (debts.length === 0) return { alert: null, progress: null, tip: null };
		
		const alerts = [];
		const progressItems = [];
		const tips = [];
		
		const currentBalance = balance && balance.balance !== null && balance.balance !== undefined ? 
			parseFloat(balance.balance.toString()) : 0;
		
		// Check active debts only
		const activeDebts = debts.filter(debt => !debt.is_fully_paid);
		
		for (const debt of activeDebts) {
			const currentAmount = parseFloat(debt.amount) || 0;
			const originalAmount = debt.original_amount ? parseFloat(debt.original_amount.toString()) : currentAmount;
			const paidAmount = originalAmount - currentAmount;
			const paymentProgress = originalAmount > 0 ? (paidAmount / originalAmount) * 100 : 0;
			
			const now = new Date();
			const startDate = new Date(debt.start_date);
			const deadlineDate = new Date(debt.expiration_date);
			
			// Calculate time progression
			const totalDays = Math.ceil((deadlineDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
			const daysPassed = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
			const daysRemaining = Math.max(0, Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
			const timeElapsed = totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;
			const timeRemaining = totalDays > 0 ? (daysRemaining / totalDays) * 100 : 0;
			
			// Alert 1: Payment progress lagging behind time (half time gone but not half paid)
			if (timeElapsed >= 50 && paymentProgress < 50) {
				const progressGap = timeElapsed - paymentProgress;
				alerts.push({
					type: 'payment_behind_schedule',
					severity: progressGap,
					debt: debt,
					timeElapsed: timeElapsed,
					paymentProgress: paymentProgress,
					progressGap: progressGap
				});
			}
			
			// Alert 2: Deadline approaching (less than 10% time remaining)
			if (timeRemaining <= 10 && timeRemaining > 0) {
				alerts.push({
					type: 'deadline_approaching',
					severity: 100 - timeRemaining, // Higher severity as deadline gets closer
					debt: debt,
					daysRemaining: daysRemaining,
					timeRemaining: timeRemaining,
					currentAmount: currentAmount
				});
			}
			
			// Alert 3: Debt amount much larger than balance (debt > 5x balance)
			if (currentBalance > 0 && currentAmount > (currentBalance * 5)) {
				const debtToBalanceRatio = currentAmount / currentBalance;
				alerts.push({
					type: 'debt_exceeds_balance',
					severity: debtToBalanceRatio,
					debt: debt,
					currentAmount: currentAmount,
					currentBalance: currentBalance,
					ratio: debtToBalanceRatio
				});
			}
			
			// Progress: Good payment pace (payment progress ahead of time)
			if (paymentProgress > timeElapsed + 10 && timeElapsed > 10) {
				const progressAdvantage = paymentProgress - timeElapsed;
				progressItems.push({
					type: 'ahead_of_schedule',
					debt: debt,
					paymentProgress: paymentProgress,
					timeElapsed: timeElapsed,
					progressAdvantage: progressAdvantage
				});
			}
		}
		
		// Generate tips
		if (activeDebts.length > 0) {
			// Find the debt with highest interest rate
			const highestInterestDebt = [...activeDebts].sort((a, b) => 
				parseFloat(b.interest_rate.toString()) - parseFloat(a.interest_rate.toString())
			)[0];
			
			// Find debts that can be fully paid with current balance
			const payableDebts = activeDebts.filter(debt => 
				parseFloat(debt.amount) <= currentBalance
			).sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount)); // Sort by amount, smallest first
			
			if (payableDebts.length > 0) {
				tips.push({
					type: 'payoff_opportunity',
					debt: payableDebts[0], // Suggest paying off the smallest debt first
					currentBalance: currentBalance
				});
			} else if (currentBalance > 0) {
				tips.push({
					type: 'prioritize_high_interest',
					debt: highestInterestDebt,
					interestRate: parseFloat(highestInterestDebt.interest_rate.toString())
				});
			} else {
				tips.push({
					type: 'increase_balance',
					debtCount: activeDebts.length
				});
			}
		}
		
		// Sort alerts by severity (highest first)
		alerts.sort((a, b) => b.severity - a.severity);
		progressItems.sort((a, b) => b.progressAdvantage - a.progressAdvantage);
		
		return {
			alert: alerts.length > 0 ? alerts[0] : null,
			progress: progressItems.length > 0 ? progressItems[0] : null,
			tip: tips.length > 0 ? tips[0] : null
		};
	}

	// Get the debt insights as a derived value
	let debtInsights = $derived(getDebtInsights());
	
	async function handleAddDebt(event: Event) {
		event.preventDefault();
		
		if (!formDescription || !formAmount || !formInterestRate || !formTakenFrom || !formStartDate || !formExpirationDate) {
			error = 'Please fill in all required fields';
			return;
		}

		// Validate start date vs expiration date
		const startDate = new Date(formStartDate);
		const expirationDate = new Date(formExpirationDate);
		
		if (expirationDate <= startDate) {
			createDebtError = 'Expiration date must be after the start date';
			return;
		}

		// Validate amounts are positive
		if (parseFloat(formAmount) <= 0) {
			createDebtError = 'Debt amount must be greater than 0';
			return;
		}

		if (parseFloat(formInterestRate) < 0) {
			createDebtError = 'Interest rate cannot be negative';
			return;
		}

		isSaving = true;
		createDebtError = null;
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
			createDebtError = err instanceof Error ? err.message : 'Failed to create debt';
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

		if (paymentAmount > parseFloat(selectedDebt.amount)) {
			error = 'Payment amount cannot exceed total due amount';
			return;
		}

		// Check if user has sufficient balance (frontend validation)
		if (balance && balance.balance !== null && balance.balance !== undefined) {
			const currentBalance = parseFloat(balance.balance.toString());
			if (currentBalance < paymentAmount) {
				error = `Insufficient balance. Current balance: $${currentBalance.toFixed(2)}, Payment amount: $${paymentAmount.toFixed(2)}`;
				return;
			}
		}

		isSaving = true;
		error = null;
		try {
			// Use the new dedicated payment endpoint that handles both debt and balance
			const paymentResult = await debtService.makePayment(selectedDebt.id, paymentAmount);
			
			// Update local state with the returned data
			if (paymentResult.data) {
				// Update balance from the response
				if (paymentResult.data.balance) {
					balance = paymentResult.data.balance;
				}
			}

			// Reload data to get updated amounts
			await loadData();
			
			isPaymentOpen = false;
			selectedDebt = null;
			
			successMessage = `Payment of $${paymentAmount.toFixed(2)} recorded successfully`;
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

		// Validate start date vs expiration date
		const startDate = new Date(editFormStartDate);
		const expirationDate = new Date(editFormExpirationDate);
		
		if (expirationDate <= startDate) {
			error = 'Expiration date must be after the start date';
			return;
		}

		// Validate amounts are positive
		if (parseFloat(editFormAmount) <= 0) {
			error = 'Debt amount must be greater than 0';
			return;
		}

		if (parseFloat(editFormInterestRate) < 0) {
			error = 'Interest rate cannot be negative';
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

		deletingDebtId = debt.id;
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
			deletingDebtId = null;
		}
	}

	function getDebtStatus(amount: number, originalAmount: number) {
		if (originalAmount <= 0) return { status: "No Debt", color: "text-gray-400", bgColor: "bg-gray-500/20" };
		const percentage = ((originalAmount - amount) / originalAmount) * 100;
		if (percentage >= 100) return { status: "Paid Off", color: "text-green-400", bgColor: "bg-green-500/20" };
		if (percentage >= 75) return { status: "Almost Done", color: "text-yellow-400", bgColor: "bg-yellow-500/20" };
		if (percentage >= 25) return { status: "In Progress", color: "text-blue-400", bgColor: "bg-blue-500/20" };
		return { status: "Getting Started", color: "text-red-400", bgColor: "bg-red-500/20" };
	}

	// Helper function to calculate remaining time until debt expiration
	function getRemainingTime(debt: Debt) {
		// If debt is fully paid, show "Fully paid" with the date
		if (debt.is_fully_paid && debt.fully_paid_date) {
			const paidDate = new Date(debt.fully_paid_date).toLocaleDateString();
			return { formatted: `Fully paid (${paidDate})`, isOverdue: false, isFullyPaid: true };
		}

		const now = new Date();
		const expiry = new Date(debt.expiration_date);
		const timeDiff = expiry.getTime() - now.getTime();
		
		if (timeDiff <= 0) {
			return { formatted: "Overdue", isOverdue: true, isFullyPaid: false };
		}
		
		const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
		const years = Math.floor(totalDays / 365);
		const months = Math.floor((totalDays % 365) / 30);
		const days = totalDays % 30;
		
		let parts = [];
		if (years > 0) parts.push(`${years}y`);
		if (months > 0) parts.push(`${months}m`);
		if (days > 0 || parts.length === 0) parts.push(`${days}d`);
		
		return { formatted: parts.join(' '), isOverdue: false, isFullyPaid: false };
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
				
				<!-- Error Message for Create Debt Dialog -->
				{#if createDebtError}
					<div class="mb-4 rounded-lg border border-red-500 bg-red-900/50 p-3">
						<p class="text-sm text-red-300">{createDebtError}</p>
					</div>
				{/if}
				
				<form on:submit={handleAddDebt} class="space-y-4">
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
			<form on:submit={handleUpdateDebt} class="space-y-4">
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
	<div class="grid gap-4 md:grid-cols-3">
		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-white">Account Balance</CardTitle>
				<Wallet class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				{#if balance && balance.balance !== null && balance.balance !== undefined}
					{@const balanceValue = parseFloat(balance.balance.toString())}
					<div class="text-2xl font-bold {balanceValue >= 0 ? 'text-green-400' : 'text-red-400'}">
						${balanceValue.toFixed(2)}
					</div>
					<p class="text-xs text-gray-400">Available for payments</p>
				{:else}
					<div class="text-2xl font-bold text-gray-400">N/A</div>
					<p class="text-xs text-gray-400">Balance not available</p>
				{/if}
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-white">Total Debt</CardTitle>
				<CreditCard class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-red-600">${(totalDebtWithInterest || 0).toFixed(2)}</div>
				<p class="text-xs text-gray-400">{debts.filter(debt => !debt.is_fully_paid).length} active of {debts.length} total debts</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-white">Earliest Deadline</CardTitle>
				<Calendar class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-lg font-bold text-white">
					{typeof earliestDeadline === 'string' ? earliestDeadline : earliestDeadline.date}
				</div>
				<p class="text-xs text-gray-400">
					{typeof earliestDeadline === 'string' ? 'No active debts' : earliestDeadline.description}
				</p>
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
					{@const originalDebtAmount = debt.original_amount ? parseFloat(debt.original_amount.toString()) : parseFloat(debt.amount) || 0}
					{@const currentAmount = parseFloat(debt.amount) || 0}
					{@const paidAmount = originalDebtAmount - currentAmount}
					{@const debtStatus = getDebtStatus(parseFloat(debt.amount) || 0, originalDebtAmount)}
					{@const timeRemaining = getRemainingTime(debt)}
					
					<div class="border border-gray-700 rounded-lg p-4 bg-gray-800 relative">
						<!-- Remaining Balance - Top Right Corner -->
						<div class="absolute top-2 right-2 text-right">
							<div class="flex items-baseline gap-1">
								{#if debt.is_fully_paid}
									<span class="text-sm text-gray-400">Status:</span>
									<span class="text-lg font-bold text-green-400">Paid</span>
								{:else}
									<span class="text-sm text-gray-400">Total Due:</span>
									<span class="text-lg font-bold text-white">${(parseFloat(debt.amount) || 0).toFixed(2)}</span>
								{/if}
							</div>
						</div>

						<!-- Action Buttons - Right Side, Below Remaining Balance -->
						<div class="absolute top-20 right-2 flex gap-2">
							{#if !debt.is_fully_paid}
								<Button 
									variant="outline" 
									size="sm" 
									onclick={() => {
										selectedDebt = debt;
										isPaymentOpen = true;
									}}
									class="bg-gray-900 border-2 border-blue-500 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 font-semibold shadow-lg"
								>
									Pay Amount
								</Button>
							{/if}
							<Button 
								variant="outline" 
								size="sm" 
								onclick={() => handleEditDebt(debt)}
								class="bg-gray-900 border-2 border-green-500 text-green-400 hover:bg-green-500/20 hover:text-green-300 font-semibold shadow-lg"
							>
								<Edit class="h-4 w-4 mr-1" />
								Edit
							</Button>
							<Button 
								variant="outline" 
								size="sm" 
								onclick={() => handleDeleteDebt(debt)}
								disabled={deletingDebtId === debt.id}
								class="bg-gray-900 border-2 border-red-500 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-semibold shadow-lg disabled:opacity-50"
							>
								<Trash2 class="h-4 w-4 mr-1" />
								{deletingDebtId === debt.id ? 'Deleting...' : 'Delete'}
							</Button>
						</div>

						<div class="pr-4">
							<div>
								<div class="flex items-center gap-2">
									<h3 class="font-semibold text-white">{debt.description}</h3>
									<Badge variant={debt.type === "bank" ? "default" : "secondary"}>{debt.type}</Badge>
									<Badge class="{debtStatus.bgColor} {debtStatus.color} border-0">
										{debtStatus.status}
									</Badge>
									{#if debt.is_fully_paid}
										<Badge class="bg-green-500/20 text-green-400 border-0">
											Fully Paid
										</Badge>
									{/if}
								</div>
								<p class="text-sm text-gray-400">
									{debt.interest_rate}% Interest Rate • Due: {new Date(debt.expiration_date).toLocaleDateString()}
								</p>
								<p class="text-xs text-gray-500">From: {debt.taken_from}</p>
								<!-- Show original total debt amount -->
								<p class="text-xs text-blue-300 font-medium">
									Original debt: ${originalDebtAmount.toFixed(2)}
								</p>
								{#if paidAmount > 0 || debt.last_payment_date}
									<div class="flex items-center gap-4">
										{#if paidAmount > 0}
											<p class="text-xs text-green-300 font-medium">
												Paid so far: ${paidAmount.toFixed(2)}
											</p>
										{/if}
										{#if debt.last_payment_date}
											<p class="text-xs text-green-300 font-medium">
												Last paid: {new Date(debt.last_payment_date).toLocaleDateString()}
											</p>
										{/if}
									</div>
								{/if}
								<div class="mt-2">
									<span class="text-base font-medium {timeRemaining.isFullyPaid ? 'text-green-400' : timeRemaining.isOverdue ? 'text-red-400' : 'text-blue-400'}">
										Time remaining: {timeRemaining.formatted}
									</span>
								</div>
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

	<!-- Debt Insights -->
	<Card class="bg-gray-900 border-gray-800">
		<CardHeader>
			<CardTitle class="text-white">Debt Insights</CardTitle>
			<CardDescription class="text-gray-400">AI-powered recommendations for your debt management</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<!-- Alert Box (Red/Yellow) -->
				{#if debtInsights.alert}
					{#if debtInsights.alert.type === 'payment_behind_schedule'}
						<div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
							<h4 class="font-semibold text-red-400">Payment Behind Schedule</h4>
							<p class="text-sm text-gray-300 mt-1">
								Your {debtInsights.alert.debt.description} debt is {debtInsights.alert.progressGap.toFixed(0)}% behind schedule. 
								{debtInsights.alert.timeElapsed.toFixed(0)}% of time has passed but only {debtInsights.alert.paymentProgress.toFixed(0)}% has been paid. 
								Consider increasing your payment amount to stay on track.
							</p>
						</div>
					{:else if debtInsights.alert.type === 'deadline_approaching'}
						<div class="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
							<h4 class="font-semibold text-yellow-400">Deadline Approaching</h4>
							<p class="text-sm text-gray-300 mt-1">
								Your {debtInsights.alert.debt.description} debt is due in {debtInsights.alert.daysRemaining} day{debtInsights.alert.daysRemaining !== 1 ? 's' : ''}! 
								You still owe ${debtInsights.alert.currentAmount.toFixed(2)}. Take immediate action to avoid penalties.
							</p>
						</div>
					{:else if debtInsights.alert.type === 'debt_exceeds_balance'}
						<div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
							<h4 class="font-semibold text-red-400">Debt Significantly Exceeds Balance</h4>
							<p class="text-sm text-gray-300 mt-1">
								Your {debtInsights.alert.debt.description} debt (${debtInsights.alert.currentAmount.toFixed(2)}) is {debtInsights.alert.ratio.toFixed(1)}x larger than your current balance (${debtInsights.alert.currentBalance.toFixed(2)}). 
								Consider increasing your income or creating a structured payment plan.
							</p>
						</div>
					{/if}
				{:else}
					<div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
						<h4 class="font-semibold text-green-400">All Clear!</h4>
						<p class="text-sm text-gray-300 mt-1">
							{debts.filter(debt => !debt.is_fully_paid).length === 0 ? 
								'Congratulations! All your debts are fully paid.' : 
								'No debt alerts at this time. Your debt management is on track!'}
						</p>
					</div>
				{/if}

				<!-- Progress Box (Green) - Only show if there's good progress -->
				{#if debtInsights.progress}
					<div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
						<h4 class="font-semibold text-green-400">Excellent Progress!</h4>
						<p class="text-sm text-gray-300 mt-1">
							Outstanding work on your {debtInsights.progress.debt.description} debt! You're {debtInsights.progress.progressAdvantage.toFixed(0)}% ahead of schedule. 
							You've paid {debtInsights.progress.paymentProgress.toFixed(0)}% while only {debtInsights.progress.timeElapsed.toFixed(0)}% of the time period has passed.
						</p>
					</div>
				{/if}

				<!-- Tip Box (Blue) -->
				{#if debtInsights.tip}
					{#if debtInsights.tip.type === 'payoff_opportunity'}
						<div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
							<h4 class="font-semibold text-blue-400">Payoff Opportunity</h4>
							<p class="text-sm text-gray-300 mt-1">
								You can fully pay off your {debtInsights.tip.debt.description} debt (${parseFloat(debtInsights.tip.debt.amount).toFixed(2)}) with your current balance (${debtInsights.tip.currentBalance.toFixed(2)}). 
								Paying off smaller debts first can provide psychological momentum and reduce your total debt count.
							</p>
						</div>
					{:else if debtInsights.tip.type === 'prioritize_high_interest'}
						<div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
							<h4 class="font-semibold text-blue-400">Focus on High Interest</h4>
							<p class="text-sm text-gray-300 mt-1">
								Consider prioritizing payments on your {debtInsights.tip.debt.description} debt with {debtInsights.tip.interestRate.toFixed(1)}% interest rate. 
								Higher interest debts cost more over time, so paying them faster saves money in the long run.
							</p>
						</div>
					{:else if debtInsights.tip.type === 'increase_balance'}
						<div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
							<h4 class="font-semibold text-blue-400">Increase Available Balance</h4>
							<p class="text-sm text-gray-300 mt-1">
								With {debtInsights.tip.debtCount} active debt{debtInsights.tip.debtCount > 1 ? 's' : ''} and limited balance, consider increasing your income or reducing expenses to have more funds available for debt payments.
							</p>
						</div>
					{/if}
				{:else}
					<div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
						<h4 class="font-semibold text-blue-400">Debt Management Tip</h4>
						<p class="text-sm text-gray-300 mt-1">
							Consider the debt avalanche method: pay minimums on all debts, then put extra money toward the highest interest rate debt first to minimize total interest paid.
						</p>
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>

	<!-- Make Payment Dialog -->
	<Dialog bind:open={isPaymentOpen}>
		<DialogContent class="bg-gray-800 border-gray-700 text-white">
			<DialogHeader>
				<DialogTitle>Make Payment - {selectedDebt?.description}</DialogTitle>
				<DialogDescription class="text-gray-400">
					{#if selectedDebt}
						Current debt balance: ${(parseFloat(selectedDebt.amount) || 0).toFixed(2)}
						<br />
						{#if balance && balance.balance !== null && balance.balance !== undefined}
							Your account balance: ${parseFloat(balance.balance.toString()).toFixed(2)}
						{:else}
							Account balance: Not available
						{/if}
					{/if}
				</DialogDescription>
			</DialogHeader>
			<form on:submit={handlePayment} class="space-y-4">
				<div class="space-y-2">
					<Label for="amount">Payment Amount</Label>
					<Input
						id="amount"
						name="amount"
						type="number"
						step="0.01"
						placeholder={selectedDebt ? (parseFloat(selectedDebt.amount) * 0.02).toFixed(2) : "0.00"}
						min={0}
						max={selectedDebt ? parseFloat(selectedDebt.amount) : undefined}
						required
						class="bg-gray-700 border-gray-600"
					/>
					{#if balance && balance.balance !== null && balance.balance !== undefined}
						{@const availableBalance = parseFloat(balance.balance.toString())}
						{#if availableBalance <= 0}
							<p class="text-sm text-red-400">⚠️ Insufficient balance for any payment</p>
						{:else if selectedDebt && availableBalance < parseFloat(selectedDebt.amount)}
							<p class="text-sm text-yellow-400">⚠️ Balance lower than total due amount. Max payment: ${availableBalance.toFixed(2)}</p>
						{/if}
					{/if}
				</div>
				<div class="space-y-3">
					<Label class="text-sm font-medium">Quick Payment Options</Label>
					<div class="grid grid-cols-3 gap-2">
						{#if selectedDebt}
							{@const availableBalance = balance && balance.balance !== null && balance.balance !== undefined ? parseFloat(balance.balance.toString()) : 0}
							{@const debtAmount = parseFloat(selectedDebt.amount)}
							
							<!-- $10 Button -->
							<Button
								type="button"
								variant="outline"
								onclick={() => {
									const input = document.getElementById("amount");
									if (input && 'value' in input) input.value = "10.00";
								}}
								disabled={availableBalance < 10 || debtAmount < 10}
								class="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white disabled:opacity-50 transition-all"
							>
								$10
							</Button>
							
							<!-- $20 Button -->
							<Button
								type="button"
								variant="outline"
								onclick={() => {
									const input = document.getElementById("amount");
									if (input && 'value' in input) input.value = "20.00";
								}}
								disabled={availableBalance < 20 || debtAmount < 20}
								class="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white disabled:opacity-50 transition-all"
							>
								$20
							</Button>
							
							<!-- $50 Button -->
							<Button
								type="button"
								variant="outline"
								onclick={() => {
									const input = document.getElementById("amount");
									if (input && 'value' in input) input.value = "50.00";
								}}
								disabled={availableBalance < 50 || debtAmount < 50}
								class="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white disabled:opacity-50 transition-all"
							>
								$50
							</Button>
							
							<!-- $100 Button -->
							<Button
								type="button"
								variant="outline"
								onclick={() => {
									const input = document.getElementById("amount");
									if (input && 'value' in input) input.value = "100.00";
								}}
								disabled={availableBalance < 100 || debtAmount < 100}
								class="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white disabled:opacity-50 transition-all"
							>
								$100
							</Button>
							
							<!-- Pay Off Button (remaining amount) -->
							<Button
								type="button"
								variant="outline"
								onclick={() => {
									const input = document.getElementById("amount");
									if (input && 'value' in input) input.value = debtAmount.toFixed(2);
								}}
								disabled={availableBalance < debtAmount}
								class="bg-transparent border-green-500 text-green-300 hover:bg-green-500 hover:text-white disabled:opacity-50 col-span-2 transition-all"
							>
								Pay Off (${debtAmount.toFixed(2)})
							</Button>
						{/if}
					</div>
				</div>
				<div class="flex gap-2">
					<Button
						type="button"
						variant="secondary"
						onclick={() => {
							isPaymentOpen = false;
							selectedDebt = null;
						}}
						class="flex-1 bg-gray-800 text-white hover:bg-gray-700 border-gray-600"
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
	{/if}
</div>