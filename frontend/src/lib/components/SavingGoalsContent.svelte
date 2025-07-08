<script lang="ts">
	import { Target, TrendingUp, Calendar, Plus, DollarSign, Edit, Trash2 } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
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
	import { savingService, type SavingGoal } from '$lib/services/savings';
	import { transactionService } from '$lib/services/transactions';
	import { balanceService, type Balance } from '$lib/services/balance';
	import { firebaseUser, loading as authLoading } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	// State variables
	let goals = $state<SavingGoal[]>([]);
	let balance = $state<Balance | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let successMessage = $state<string | null>(null);
	let isGoalDialogOpen = $state(false);
	let isDepositDialogOpen = $state(false);
	let isEditDialogOpen = $state(false);
	let isDeleteDialogOpen = $state(false);
	let selectedGoal = $state<SavingGoal | null>(null);
	let editingGoal = $state<SavingGoal | null>(null);
	let currentPage = $state(1);
	let isSaving = $state(false);
	let isDeleting = $state(false);
	const itemsPerPage = 10;

	// Separate error states for dialogs
	let createGoalError = $state<string | null>(null);
	let editGoalError = $state<string | null>(null);

	// Form fields
	let formName = $state('');
	let formTarget = $state('');
	let formStartAmount = $state('');
	let formStartDate = $state(new Date().toISOString().split('T')[0]);
	let formEndDate = $state('');

	// Edit form fields
	let editFormName = $state('');
	let editFormTarget = $state('');
	let editFormStartAmount = $state('');
	let editFormStartDate = $state('');
	let editFormEndDate = $state('');

	// Wait for authentication before loading data
	$effect(() => {
		if (!$authLoading && $firebaseUser) {
			loadData();
		}
	});

	// Function to load savings goals from API
	async function loadData() {
		isLoading = true;
		error = null;
		try {
			// Load savings goals and balance data in parallel
			const [savingData, balanceData] = await Promise.all([
				savingService.getAllSavings(),
				balanceService.getBalance()
			]);

			console.log('Raw savings data from API:', savingData);
			if (savingData && savingData.length > 0) {
				console.log('First goal data structure:', savingData[0]);
				console.log(
					'Target amount type:',
					typeof savingData[0].target_amount,
					'Value:',
					savingData[0].target_amount
				);
				console.log(
					'Start amount type:',
					typeof savingData[0].start_amount,
					'Value:',
					savingData[0].start_amount
				);
			}
			goals = savingData;
			balance = balanceData;
			console.log('Goals state updated:', goals);
			console.log('Balance state updated:', balance);
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

	const getPaginatedGoals = () => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		const paginatedGoals = goals.slice(startIndex, endIndex);

		return {
			goals: paginatedGoals,
			totalCount: goals.length,
			totalPages: Math.ceil(goals.length / itemsPerPage),
			startIndex: startIndex + 1,
			endIndex: Math.min(endIndex, goals.length)
		};
	};

	const paginatedData = $derived(getPaginatedGoals());
	const totalTargets = $derived(
		goals.reduce((sum, goal) => sum + safeParseFloat(goal.target_amount), 0)
	);
	const totalSaved = $derived(
		goals.reduce((sum, goal) => sum + safeParseFloat(goal.start_amount), 0)
	);
	const overallProgress = $derived(totalTargets > 0 ? (totalSaved / totalTargets) * 100 : 0);
	const completedGoals = $derived(
		goals.filter((goal) => {
			const startAmount = safeParseFloat(goal.start_amount);
			const targetAmount = safeParseFloat(goal.target_amount);
			return goal.completed || startAmount >= targetAmount;
		}).length
	);

	// Calculate savings insights based on your rules
	function getSavingsInsights() {
		if (goals.length === 0) return { alert: null, progress: null, tip: null };

		// Find the most relevant goal to give insights about - exclude completed goals
		const activeGoals = goals.filter((goal) => {
			const currentAmount = safeParseFloat(goal.start_amount);
			const targetAmount = safeParseFloat(goal.target_amount);
			const isActuallyCompleted = goal.completed || currentAmount >= targetAmount;

			return (
				!isActuallyCompleted &&
				targetAmount > 0 &&
				goal.description &&
				goal.description.trim() !== ''
			);
		});

		if (activeGoals.length === 0) {
			// All goals are completed or no valid goals
			return { alert: null, progress: null, tip: null };
		}

		// Pick the first active goal for simplicity
		const primaryGoal = activeGoals[0];
		const currentAmount = safeParseFloat(primaryGoal.start_amount);
		const targetAmount = safeParseFloat(primaryGoal.target_amount);
		const now = new Date();
		const endDate = new Date(primaryGoal.end_date);
		const startDate = new Date(primaryGoal.start_date);

		// Calculate basic metrics
		const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
		const remainingAmount = Math.max(0, targetAmount - currentAmount);
		const totalDays = Math.max(
			1,
			(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
		);
		const elapsedDays = Math.max(0, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
		const remainingDays = Math.max(1, totalDays - elapsedDays);
		const remainingMonths = remainingDays / 30.44;
		const requiredMonthlySavings = remainingAmount / remainingMonths;

		// Time elapsed percentage
		const timeElapsedPercentage = (elapsedDays / totalDays) * 100;

		let alert = null;
		let progress = null;
		let tip = null;

		// Alert: Check if falling behind
		if (progressPercentage < 10 && timeElapsedPercentage > 25) {
			alert = {
				type: 'falling_behind',
				goal: primaryGoal,
				requiredMonthlySavings: Math.round(requiredMonthlySavings),
				currentProgress: Math.round(progressPercentage)
			};
		}

		// Progress: Check if doing well
		if (progressPercentage >= 25 && progressPercentage > timeElapsedPercentage) {
			const monthsAhead = Math.max(
				0,
				((progressPercentage - timeElapsedPercentage) / 100) * (totalDays / 30.44)
			);
			progress = {
				type: 'on_track',
				goal: primaryGoal,
				monthsEarly: Math.round(monthsAhead),
				currentRate: Math.round(currentAmount / Math.max(1, elapsedDays / 30.44))
			};
		}

		// Tip: Always provide optimization tip for active goals
		if (remainingAmount > 0) {
			tip = {
				type: 'automatic_transfer',
				goal: primaryGoal,
				recommendedAmount: Math.round(requiredMonthlySavings)
			};
		}

		// Priority adjustment for multiple goals
		if (activeGoals.length > 3) {
			const lowProgressGoals = activeGoals.filter((goal) => {
				const progress =
					(safeParseFloat(goal.start_amount) / safeParseFloat(goal.target_amount)) * 100;
				return progress < 30;
			});

			if (lowProgressGoals.length > 0) {
				tip = {
					type: 'reduce_low_priority',
					totalGoals: activeGoals.length,
					highPriorityGoal: lowProgressGoals[0]
				};
			}
		}
	}

	// Get saving goals insights for alerts and recommendations
	function getSavingInsights() {
		if (goals.length === 0) return { alert: null, progress: null, tip: null };

		const alerts = [];
		const progressItems = [];
		const tips = [];

		const currentBalance =
			balance && balance.balance !== null && balance.balance !== undefined
				? parseFloat(balance.balance.toString())
				: 0;

		// Check active goals only (not completed)
		const activeGoals = goals.filter((goal) => !goal.completed);

		for (const goal of activeGoals) {
			const currentAmount = safeParseFloat(goal.start_amount);
			const targetAmount = safeParseFloat(goal.target_amount);
			const remainingAmount = Math.max(0, targetAmount - currentAmount);
			const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

			const now = new Date();
			const startDate = new Date(goal.start_date);
			const endDate = new Date(goal.end_date);

			// Calculate time progression
			const totalDays = Math.ceil(
				(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
			);
			const daysPassed = Math.max(
				0,
				Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
			);
			const daysRemaining = Math.max(
				0,
				Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
			);
			const timeElapsed = totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;
			const timeRemaining = totalDays > 0 ? (daysRemaining / totalDays) * 100 : 0;

			// Alert 1: Saving speed doesn't match time limit (time > progress by significant margin)
			if (timeElapsed >= 25 && timeElapsed > progress + 15) {
				// At least 25% time passed and 15% gap
				const progressGap = timeElapsed - progress;
				alerts.push({
					type: 'saving_behind_schedule',
					severity: progressGap,
					goal: goal,
					timeElapsed: timeElapsed,
					progress: progress,
					progressGap: progressGap,
					remainingAmount: remainingAmount,
					daysRemaining: daysRemaining
				});
			}

			// Alert 2: Balance is insufficient for goal's remaining amount
			if (currentBalance > 0 && remainingAmount > currentBalance * 2) {
				// Remaining > 2x balance
				const balanceGap = remainingAmount / currentBalance;
				alerts.push({
					type: 'insufficient_balance',
					severity: balanceGap,
					goal: goal,
					currentBalance: currentBalance,
					remainingAmount: remainingAmount,
					balanceGap: balanceGap
				});
			}

			// Alert 3: Goal deadline approaching with significant amount remaining
			if (timeRemaining <= 15 && timeRemaining > 0 && progress < 80) {
				// <15% time left, <80% progress
				alerts.push({
					type: 'deadline_approaching',
					severity: 100 - timeRemaining + (100 - progress), // Combined urgency score
					goal: goal,
					daysRemaining: daysRemaining,
					timeRemaining: timeRemaining,
					progress: progress,
					remainingAmount: remainingAmount
				});
			}

			// Progress: Good saving pace (progress ahead of time)
			if (progress > timeElapsed + 10 && timeElapsed > 10) {
				// At least 10% ahead
				const progressAdvantage = progress - timeElapsed;
				progressItems.push({
					type: 'ahead_of_schedule',
					goal: goal,
					progress: progress,
					timeElapsed: timeElapsed,
					progressAdvantage: progressAdvantage,
					daysRemaining: daysRemaining
				});
			}
		}

		// Generate tips
		if (activeGoals.length > 0) {
			// Find goals that can be completed with current balance
			const achievableGoals = activeGoals
				.filter((goal) => {
					const remainingAmount =
						safeParseFloat(goal.target_amount) - safeParseFloat(goal.start_amount);
					return remainingAmount <= currentBalance;
				})
				.sort((a, b) => {
					const remainingA = safeParseFloat(a.target_amount) - safeParseFloat(a.start_amount);
					const remainingB = safeParseFloat(b.target_amount) - safeParseFloat(b.start_amount);
					return remainingA - remainingB; // Sort by smallest remaining amount first
				});

			// Find goals closest to deadline
			const urgentGoals = [...activeGoals].sort((a, b) => {
				const daysRemainingA = Math.ceil(
					(new Date(a.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
				);
				const daysRemainingB = Math.ceil(
					(new Date(b.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
				);
				return daysRemainingA - daysRemainingB;
			});

			if (achievableGoals.length > 0) {
				tips.push({
					type: 'completion_opportunity',
					goal: achievableGoals[0],
					currentBalance: currentBalance,
					remainingAmount:
						safeParseFloat(achievableGoals[0].target_amount) -
						safeParseFloat(achievableGoals[0].start_amount)
				});
			} else if (urgentGoals.length > 0) {
				const urgentGoal = urgentGoals[0];
				const daysRemaining = Math.ceil(
					(new Date(urgentGoal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
				);
				const remainingAmount =
					safeParseFloat(urgentGoal.target_amount) - safeParseFloat(urgentGoal.start_amount);
				const dailyRequired = daysRemaining > 0 ? remainingAmount / daysRemaining : remainingAmount;

				tips.push({
					type: 'prioritize_urgent',
					goal: urgentGoal,
					daysRemaining: daysRemaining,
					dailyRequired: dailyRequired,
					remainingAmount: remainingAmount
				});
			} else if (currentBalance > 0) {
				tips.push({
					type: 'allocate_balance',
					currentBalance: currentBalance,
					goalCount: activeGoals.length
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

	// Get the saving insights as a derived value
	let savingInsights = $derived(getSavingInsights());

	async function handleAddGoal(event: Event) {
		event.preventDefault();

		if (!formName || !formTarget || !formStartDate || !formEndDate) {
			error = 'Please fill in all required fields';
			return;
		}

		// Validate start date vs end date
		const startDate = new Date(formStartDate);
		const endDate = new Date(formEndDate);

		if (endDate <= startDate) {
			createGoalError = 'End date must be after the start date';
			return;
		}

		// Validate target amount is positive
		if (parseFloat(formTarget) <= 0) {
			createGoalError = 'Target amount must be greater than 0';
			return;
		}

		// Validate starting amount is not negative and not greater than target
		if (formStartAmount && parseFloat(formStartAmount) < 0) {
			createGoalError = 'Starting amount cannot be negative';
			return;
		}

		if (formStartAmount && parseFloat(formStartAmount) > parseFloat(formTarget)) {
			createGoalError = 'Starting amount cannot be greater than the target amount';
			return;
		}

		isSaving = true;
		createGoalError = null;
		try {
			await savingService.createSaving({
				description: formName,
				target_amount: parseFloat(formTarget),
				start_amount: parseFloat(formStartAmount) || 0,
				start_date: formStartDate,
				end_date: formEndDate
			});

			// Reload data to get the new saving goal
			await loadData();

			isGoalDialogOpen = false;

			// Reset form
			formName = '';
			formTarget = '';
			formStartAmount = '';
			formStartDate = new Date().toISOString().split('T')[0];
			formEndDate = '';

			// Show success message
			successMessage = 'Savings goal created successfully';
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error creating saving goal:', err);
			createGoalError = err instanceof Error ? err.message : 'Failed to create saving goal';
		} finally {
			isSaving = false;
		}
	}

	async function handleTransfer(event: Event) {
		event.preventDefault();

		if (!selectedGoal) return;

		const formData = new FormData(event.target as HTMLFormElement);
		const amount = Number.parseFloat(formData.get('amount') as string);

		if (isNaN(amount) || amount === 0) {
			error = 'Please enter a valid amount';
			return;
		}

		isSaving = true;
		error = null;
		try {
			const currentSavedAmount = safeParseFloat(selectedGoal.start_amount);
			const targetAmount = safeParseFloat(selectedGoal.target_amount);

			// Calculate new saved amount (can be positive or negative change)
			let newSavedAmount = currentSavedAmount + amount;

			// Ensure the saved amount doesn't go below 0 or above target
			if (newSavedAmount < 0) {
				error = `Cannot withdraw more than saved amount ($${currentSavedAmount.toFixed(2)})`;
				return;
			}

			if (newSavedAmount > targetAmount) {
				newSavedAmount = targetAmount;
			}

			const actualAmountTransferred = newSavedAmount - currentSavedAmount;
			const isCompleted = newSavedAmount >= targetAmount;

			// Update saving goal
			await savingService.updateSaving(selectedGoal.id, {
				start_amount: newSavedAmount,
				completed: isCompleted
			});

			// Update user balance (opposite of the transfer amount)
			if (balance && balance.balance !== null && balance.balance !== undefined) {
				const currentBalance = parseFloat(balance.balance);
				const newBalanceValue = currentBalance - actualAmountTransferred; // Subtract because money goes TO savings

				try {
					await balanceService.updateBalance(newBalanceValue);
					if (balance && balance.id && balance.user_id) {
						balance = {
							...balance,
							balance: newBalanceValue.toString()
						};
					}
				} catch (balanceErr) {
					console.error('Error updating balance:', balanceErr);
					// Continue with savings update even if balance update fails
				}
			}

			// Reload data to get updated amounts
			await loadData();

			isDepositDialogOpen = false;
			selectedGoal = null;

			const actionText = actualAmountTransferred > 0 ? 'transferred to' : 'withdrawn from';
			successMessage = `$${Math.abs(actualAmountTransferred).toFixed(2)} ${actionText} savings goal successfully`;
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error processing transfer:', err);
			error = err instanceof Error ? err.message : 'Failed to process transfer';
		} finally {
			isSaving = false;
		}
	}

	function handleEditGoal(goal: SavingGoal) {
		editingGoal = goal;
		editFormName = goal.description;
		editFormTarget = goal.target_amount.toString();
		editFormStartAmount = goal.start_amount.toString();
		editFormStartDate = goal.start_date;
		editFormEndDate = goal.end_date;
		isEditDialogOpen = true;
	}

	async function handleUpdateGoal(event: Event) {
		event.preventDefault();

		if (
			!editingGoal ||
			!editFormName ||
			!editFormTarget ||
			!editFormStartDate ||
			!editFormEndDate
		) {
			error = 'Please fill in all required fields';
			return;
		}

		// Validate start date vs end date
		const startDate = new Date(editFormStartDate);
		const endDate = new Date(editFormEndDate);

		if (endDate <= startDate) {
			editGoalError = 'End date must be after the start date';
			return;
		}

		// Validate target amount is positive
		if (parseFloat(editFormTarget) <= 0) {
			editGoalError = 'Target amount must be greater than 0';
			return;
		}

		// Validate starting amount is not negative and not greater than target
		if (editFormStartAmount && parseFloat(editFormStartAmount) < 0) {
			editGoalError = 'Starting amount cannot be negative';
			return;
		}

		if (editFormStartAmount && parseFloat(editFormStartAmount) > parseFloat(editFormTarget)) {
			editGoalError = 'Starting amount cannot be greater than the target amount';
			return;
		}

		isSaving = true;
		editGoalError = null;
		try {
			const targetAmount = parseFloat(editFormTarget);
			const startAmount = parseFloat(editFormStartAmount);
			const isCompleted = startAmount >= targetAmount;

			await savingService.updateSaving(editingGoal.id, {
				description: editFormName,
				target_amount: targetAmount,
				start_amount: startAmount,
				start_date: editFormStartDate,
				end_date: editFormEndDate,
				completed: isCompleted
			});

			// Reload data to get the updated goal
			await loadData();

			isEditDialogOpen = false;
			editingGoal = null;

			successMessage = 'Savings goal updated successfully';
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error updating saving goal:', err);
			editGoalError = err instanceof Error ? err.message : 'Failed to update saving goal';
		} finally {
			isSaving = false;
		}
	}

	async function handleDeleteGoal(goal: SavingGoal) {
		if (!confirm(`Are you sure you want to delete the savings goal "${goal.description}"?`)) {
			return;
		}

		isDeleting = true;
		error = null;
		try {
			await savingService.deleteSaving(goal.id);

			// Reload data to remove the deleted goal
			await loadData();

			successMessage = 'Savings goal deleted successfully';
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error deleting saving goal:', err);
			error = err instanceof Error ? err.message : 'Failed to delete saving goal';
		} finally {
			isDeleting = false;
		}
	}

	function getPriorityColor(priority: string) {
		switch (priority) {
			case 'high':
				return 'bg-red-500/20 text-red-400 border-red-500/50';
			case 'medium':
				return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
			case 'low':
				return 'bg-green-500/20 text-green-400 border-green-500/50';
			default:
				return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
		}
	}

	function setQuickAmount(amount: string) {
		const amountInput = document.getElementById('amount') as HTMLInputElement;
		if (amountInput) {
			amountInput.value = amount;
		}
	}

	function setCompleteAmount(goal: SavingGoal) {
		const amountInput = document.getElementById('amount') as HTMLInputElement;
		if (amountInput && goal) {
			const remainingAmount = goal.target_amount - goal.start_amount;
			amountInput.value = remainingAmount.toString();
		}
	}

	// Quick amount functions for deposit modal
	function getTodayDate() {
		return new Date().toISOString().split('T')[0];
	}

	// Helper function to safely parse numbers from API data
	function safeParseFloat(value: any): number {
		if (typeof value === 'number') return isNaN(value) ? 0 : value;
		if (typeof value === 'string') {
			const parsed = parseFloat(value);
			return isNaN(parsed) ? 0 : parsed;
		}
		return 0;
	}

	// Helper function to format currency consistently
	function formatCurrency(amount: number | string): string {
		const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
		return isNaN(numAmount)
			? '0.00'
			: numAmount.toLocaleString('en-US', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				});
	}

	function getGoalStatus(current: number, target: number) {
		const safeTarget = target || 0;
		const safeCurrent = current || 0;

		if (safeTarget <= 0)
			return { status: 'No Target', color: 'text-gray-400', bgColor: 'bg-gray-500/20' };

		const percentage = (safeCurrent / safeTarget) * 100;
		if (percentage >= 100)
			return { status: 'Completed', color: 'text-green-400', bgColor: 'bg-green-500/20' };
		if (percentage >= 75)
			return { status: 'Almost There', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
		if (percentage >= 25)
			return { status: 'In Progress', color: 'text-blue-400', bgColor: 'bg-blue-500/20' };
		return { status: 'Getting Started', color: 'text-gray-400', bgColor: 'bg-gray-500/20' };
	}
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
			<div class="text-gray-400">Loading savings goals...</div>
		</div>
	{:else}
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-2xl font-bold text-white">Savings Goals</h2>
				<p class="text-gray-400">Track progress toward your financial goals</p>
			</div>

			<Dialog bind:open={isGoalDialogOpen}>
				<DialogTrigger>
					<Button
						class="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
					>
						<Plus class="mr-2 h-4 w-4" />
						Add Goal
					</Button>
				</DialogTrigger>
				<DialogContent class="border-gray-700 bg-gray-800 text-white sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Create New Savings Goal</DialogTitle>
						<DialogDescription class="text-gray-400"
							>Set a new financial goal to work towards</DialogDescription
						>
					</DialogHeader>

					<!-- Error Message for Create Goal Dialog -->
					{#if createGoalError}
						<div class="mb-4 rounded-lg border border-red-500 bg-red-900/50 p-3">
							<p class="text-sm text-red-300">{createGoalError}</p>
						</div>
					{/if}

					<form onsubmit={handleAddGoal} class="space-y-4">
						<div class="space-y-2">
							<Label for="name">Goal Name</Label>
							<Input
								id="name"
								bind:value={formName}
								placeholder="e.g., Emergency Fund, Vacation"
								required
								class="border-gray-600 bg-gray-700"
							/>
						</div>
						<div class="space-y-2">
							<Label for="target">Target Amount</Label>
							<Input
								id="target"
								bind:value={formTarget}
								type="number"
								step="0.01"
								placeholder="0.00"
								required
								class="border-gray-600 bg-gray-700"
							/>
						</div>
						<div class="space-y-2">
							<Label for="startAmount">Starting Amount (Optional)</Label>
							<Input
								id="startAmount"
								bind:value={formStartAmount}
								type="number"
								step="0.01"
								placeholder="0.00"
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
							<Label for="deadline">Target Date</Label>
							<Input
								id="deadline"
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
							{isSaving ? 'Creating...' : 'Create Goal'}
						</Button>
					</form>
				</DialogContent>
			</Dialog>
		</div>

		<!-- Edit Goal Dialog -->
		<Dialog bind:open={isEditDialogOpen}>
			<DialogContent class="border-gray-700 bg-gray-800 text-white sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Savings Goal</DialogTitle>
					<DialogDescription class="text-gray-400"
						>Update your savings goal settings</DialogDescription
					>
				</DialogHeader>

				<!-- Error Message for Edit Goal Dialog -->
				{#if editGoalError}
					<div class="mb-4 rounded-lg border border-red-500 bg-red-900/50 p-3">
						<p class="text-sm text-red-300">{editGoalError}</p>
					</div>
				{/if}

				<form onsubmit={handleUpdateGoal} class="space-y-4">
					<div class="space-y-2">
						<Label for="editName">Goal Name</Label>
						<Input
							id="editName"
							bind:value={editFormName}
							placeholder="e.g., Emergency Fund, Vacation"
							required
							class="border-gray-600 bg-gray-700"
						/>
					</div>
					<div class="space-y-2">
						<Label for="editTarget">Target Amount</Label>
						<Input
							id="editTarget"
							bind:value={editFormTarget}
							type="number"
							step="0.01"
							placeholder="0.00"
							required
							class="border-gray-600 bg-gray-700"
						/>
					</div>
					<div class="space-y-2">
						<Label for="editStartAmount">Current Amount</Label>
						<Input
							id="editStartAmount"
							bind:value={editFormStartAmount}
							type="number"
							step="0.01"
							placeholder="0.00"
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
						<Label for="editEndDate">Target Date</Label>
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
							{isSaving ? 'Updating...' : 'Update Goal'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>

		<!-- Goals Overview -->
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card class="border-gray-800 bg-gray-900">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-gray-300">Total Goals</CardTitle>
					<Target class="h-4 w-4 text-gray-400" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-white">
						{#if isLoading}
							Loading...
						{:else}
							${formatCurrency(totalTargets)}
						{/if}
					</div>
					<p class="text-xs text-gray-400">{goals.length} active goals</p>
				</CardContent>
			</Card>

			<Card class="border-gray-800 bg-gray-900">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-gray-300">Total Saved</CardTitle>
					<DollarSign class="h-4 w-4 text-gray-400" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-green-400">
						{#if isLoading}
							Loading...
						{:else}
							${formatCurrency(totalSaved)}
						{/if}
					</div>
					<p class="text-xs text-gray-400">
						{totalTargets > 0 ? overallProgress.toFixed(1) : '0.0'}% of total goals
					</p>
				</CardContent>
			</Card>

			<Card class="border-gray-800 bg-gray-900">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-gray-300">Overall Progress</CardTitle>
					<TrendingUp class="h-4 w-4 text-gray-400" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-white">{overallProgress.toFixed(1)}%</div>
					<Progress value={overallProgress} class="mt-2" />
				</CardContent>
			</Card>

			<Card class="border-gray-800 bg-gray-900">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-gray-300">Completed Goals</CardTitle>
					<Calendar class="h-4 w-4 text-gray-400" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-white">{completedGoals}</div>
					<p class="text-xs text-gray-400">Goals achieved</p>
				</CardContent>
			</Card>
		</div>

		<!-- Savings Goals List -->
		<Card class="border-gray-800 bg-gray-900">
			<CardHeader>
				<CardTitle class="text-white">Your Savings Goals</CardTitle>
				<div class="flex items-center justify-between text-gray-400">
					<span>
						Showing {paginatedData.startIndex}-{paginatedData.endIndex} of {paginatedData.totalCount}
						goals
					</span>
					<span class="text-sm">
						Page {currentPage} of {paginatedData.totalPages}
					</span>
				</div>
			</CardHeader>
			<CardContent>
				<div class="space-y-6">
					{#each paginatedData.goals as goal (goal.id)}
						{@const startAmount = safeParseFloat(goal.start_amount)}
						{@const targetAmount = safeParseFloat(goal.target_amount)}
						{@const percentage = targetAmount > 0 ? (startAmount / targetAmount) * 100 : 0}
						{@const remaining = Math.max(0, targetAmount - startAmount)}
						{@const isCompleted = goal.completed || startAmount >= targetAmount}
						{@const goalStatus = getGoalStatus(startAmount, targetAmount)}

						<div class="space-y-4 rounded-lg border border-gray-800 bg-gray-800 p-4">
							<div class="flex items-center justify-between">
								<div>
									<div class="flex items-center gap-2">
										<h3 class="font-semibold text-white">{goal.description}</h3>
										<Badge class="{goalStatus.bgColor} {goalStatus.color} border-0">
											{goalStatus.status}
										</Badge>
										{#if isCompleted}
											<Badge class="border-green-500/50 bg-green-500/20 text-green-400"
												>Completed</Badge
											>
										{/if}
									</div>
									<p class="text-sm text-gray-400">
										Target: {new Date(goal.end_date).toLocaleDateString()}
									</p>
								</div>
								<div class="text-right">
									<p class="text-lg font-bold text-white">${formatCurrency(startAmount)}</p>
									<p class="text-sm text-gray-400">of ${formatCurrency(targetAmount)}</p>
									<div class="mt-2 flex gap-2">
										{#if !isCompleted}
											<Button
												variant="outline"
												size="sm"
												onclick={() => {
													selectedGoal = goal;
													isDepositDialogOpen = true;
												}}
												class="flex-1 border-2 border-blue-500 bg-gray-900 font-semibold text-blue-400 shadow-lg hover:bg-blue-500/20 hover:text-blue-300"
											>
												Add Transfer
											</Button>
										{/if}
										<Button
											variant="outline"
											size="sm"
											onclick={() => handleEditGoal(goal)}
											class="flex-1 border-2 border-green-500 bg-gray-900 font-semibold text-green-400 shadow-lg hover:bg-green-500/20 hover:text-green-300"
										>
											<Edit class="mr-1 h-4 w-4" />
											Edit
										</Button>
										<Button
											variant="outline"
											size="sm"
											onclick={() => handleDeleteGoal(goal)}
											disabled={isDeleting}
											class="flex-1 border-2 border-red-500 bg-gray-900 font-semibold text-red-400 shadow-lg hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
										>
											<Trash2 class="mr-1 h-4 w-4" />
											{isDeleting ? 'Deleting...' : 'Delete'}
										</Button>
									</div>
								</div>
							</div>

							<div class="space-y-2">
								<div class="flex justify-between text-sm">
									<span class="text-gray-300">Progress</span>
									<span class="text-gray-300">{percentage.toFixed(1)}% complete</span>
								</div>
								<Progress value={Math.min(percentage, 100)} class="h-2" />
								<p class="text-xs text-gray-400">
									{#if remaining > 0}
										${formatCurrency(remaining)} remaining
									{:else}
										Goal achieved!
									{/if}
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

		<!-- Add Transfer Dialog -->
		<Dialog bind:open={isDepositDialogOpen}>
			<DialogContent class="border-gray-700 bg-gray-800 text-white sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Transfer Money - {selectedGoal?.description}</DialogTitle>
					<DialogDescription class="text-gray-400">
						{#if selectedGoal}
							Current: ${formatCurrency(safeParseFloat(selectedGoal.start_amount))} / ${formatCurrency(
								safeParseFloat(selectedGoal.target_amount)
							)}
							<br />Add positive amount to transfer TO savings, negative to withdraw FROM savings
						{/if}
					</DialogDescription>
				</DialogHeader>
				<form onsubmit={handleTransfer} class="space-y-4">
					<div class="space-y-2">
						<Label for="amount">Transfer Amount</Label>
						<Input
							id="amount"
							name="amount"
							type="number"
							step="0.01"
							placeholder="100.00 (positive to add, negative to withdraw)"
							required
							class="border-gray-600 bg-gray-700"
						/>
					</div>
					<div class="space-y-2">
						<Label class="text-sm text-gray-400">Quick Add to Savings:</Label>
						<div class="flex gap-2">
							<Button
								type="button"
								variant="outline"
								onclick={() => setQuickAmount('10')}
								class="rounded-md border-gray-400 bg-transparent text-gray-300 transition-all duration-200 hover:border-gray-300 hover:bg-white hover:text-gray-600"
							>
								+$10
							</Button>
							<Button
								type="button"
								variant="outline"
								onclick={() => setQuickAmount('20')}
								class="rounded-md border-gray-400 bg-transparent text-gray-300 transition-all duration-200 hover:border-gray-300 hover:bg-white hover:text-gray-600"
							>
								+$20
							</Button>
							<Button
								type="button"
								variant="outline"
								onclick={() => setQuickAmount('50')}
								class="rounded-md border-gray-400 bg-transparent text-gray-300 transition-all duration-200 hover:border-gray-300 hover:bg-white hover:text-gray-600"
							>
								+$50
							</Button>
							{#if selectedGoal}
								<Button
									type="button"
									variant="outline"
									onclick={() => selectedGoal && setCompleteAmount(selectedGoal)}
									class="rounded-md border-gray-400 bg-transparent text-gray-300 transition-all duration-200 hover:border-gray-300 hover:bg-white hover:text-gray-600"
								>
									Complete
								</Button>
							{/if}
						</div>
					</div>
					<div class="space-y-2">
						<Label class="text-sm text-gray-400">Quick Withdraw from Savings:</Label>
						<div class="flex gap-2">
							<Button
								type="button"
								variant="outline"
								onclick={() => setQuickAmount('-10')}
								class="rounded-md border-red-400 bg-transparent text-red-300 transition-all duration-200 hover:border-red-300 hover:bg-red-950 hover:text-red-200"
							>
								-$10
							</Button>
							<Button
								type="button"
								variant="outline"
								onclick={() => setQuickAmount('-20')}
								class="rounded-md border-red-400 bg-transparent text-red-300 transition-all duration-200 hover:border-red-300 hover:bg-red-950 hover:text-red-200"
							>
								-$20
							</Button>
							<Button
								type="button"
								variant="outline"
								onclick={() => setQuickAmount('-50')}
								class="rounded-md border-red-400 bg-transparent text-red-300 transition-all duration-200 hover:border-red-300 hover:bg-red-950 hover:text-red-200"
							>
								-$50
							</Button>
							{#if selectedGoal}
								<Button
									type="button"
									variant="outline"
									onclick={() =>
										selectedGoal && setQuickAmount(`-${safeParseFloat(selectedGoal.start_amount)}`)}
									class="rounded-md border-red-400 bg-transparent text-red-300 transition-all duration-200 hover:border-red-300 hover:bg-red-950 hover:text-red-200"
								>
									Withdraw All
								</Button>
							{/if}
						</div>
					</div>
					<div class="flex gap-2">
						<Button
							type="button"
							variant="outline"
							onclick={() => {
								isDepositDialogOpen = false;
								selectedGoal = null;
							}}
							class="flex-1 rounded-md border-red-500 bg-black text-red-500 hover:bg-red-950 hover:text-red-400"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSaving}
							class="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
						>
							{isSaving ? 'Processing...' : 'Transfer'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>

		<!-- Goal Insights -->
		<Card class="border-gray-800 bg-gray-900">
			<CardHeader>
				<CardTitle class="text-white">Goal Insights</CardTitle>
				<CardDescription class="text-gray-400"
					>AI-powered recommendations for your savings goals</CardDescription
				>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					<!-- Alert Box (Red/Yellow) -->
					{#if savingInsights.alert}
						{#if savingInsights.alert.type === 'saving_behind_schedule'}
							<div class="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
								<h4 class="font-semibold text-red-400">Saving Behind Schedule</h4>
								<p class="mt-1 text-sm text-gray-300">
									Your {savingInsights.alert.goal.description} goal is {(
										savingInsights.alert.progressGap ?? 0
									).toFixed(0)}% behind schedule.
									{(savingInsights.alert.timeElapsed ?? 0).toFixed(0)}% of time has passed but only {(
										savingInsights.alert.progress ?? 0
									).toFixed(0)}% is saved. You need to save ${savingInsights.alert.remainingAmount.toFixed(
										2
									)} in
									{savingInsights.alert.daysRemaining} days.
								</p>
							</div>
						{:else if savingInsights.alert.type === 'insufficient_balance'}
							<div class="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
								<h4 class="font-semibold text-yellow-400">Balance Insufficient for Goal</h4>
								<p class="mt-1 text-sm text-gray-300">
									Your {savingInsights.alert.goal.description} goal requires ${savingInsights.alert.remainingAmount.toFixed(
										2
									)} more, but your current balance is only ${(
										savingInsights.alert.currentBalance ?? 0
									).toFixed(2)}. Consider increasing your income or adjusting the goal target.
								</p>
							</div>
						{:else if savingInsights.alert.type === 'deadline_approaching'}
							<div class="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
								<h4 class="font-semibold text-red-400">Deadline Approaching</h4>
								<p class="mt-1 text-sm text-gray-300">
									Your {savingInsights.alert.goal.description} goal deadline is in {savingInsights
										.alert.daysRemaining} day{savingInsights.alert.daysRemaining !== 1 ? 's' : ''} but
									you're only {(savingInsights.alert.progress ?? 0).toFixed(0)}% complete. You still
									need to save ${savingInsights.alert.remainingAmount.toFixed(2)} to reach your target.
								</p>
							</div>
						{/if}
					{:else}
						<div class="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
							<h4 class="font-semibold text-green-400">All Clear!</h4>
							<p class="mt-1 text-sm text-gray-300">
								{goals.filter((goal) => !goal.completed).length === 0
									? 'Congratulations! All your saving goals are completed.'
									: 'No saving alerts at this time. Your savings are on track!'}
							</p>
						</div>
					{/if}

					<!-- Progress Box (Green) - Only show if there's good progress -->
					{#if savingInsights.progress}
						<div class="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
							<h4 class="font-semibold text-green-400">Excellent Progress!</h4>
							<p class="mt-1 text-sm text-gray-300">
								Outstanding work on your {savingInsights.progress.goal.description} goal! You're {savingInsights.progress.progressAdvantage.toFixed(
									0
								)}% ahead of schedule. You've saved {savingInsights.progress.progress.toFixed(0)}%
								while only {savingInsights.progress.timeElapsed.toFixed(0)}% of the time period has
								passed. At this pace, you'll reach your goal {savingInsights.progress
									.daysRemaining > 30
									? 'months'
									: 'days'} early!
							</p>
						</div>
					{/if}

					<!-- Tip Box (Blue) -->
					{#if savingInsights.tip}
						{#if savingInsights.tip.type === 'completion_opportunity'}
							<div class="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
								<h4 class="font-semibold text-blue-400">Completion Opportunity</h4>
								<p class="mt-1 text-sm text-gray-300">
									You can complete your {savingInsights.tip.goal?.description} goal right now! You only
									need ${(savingInsights.tip.remainingAmount ?? 0).toFixed(2)} more and your current
									balance is ${(savingInsights.tip.currentBalance ?? 0).toFixed(2)}. Completing
									goals provides motivation and frees up future savings for other targets.
								</p>
							</div>
						{:else if savingInsights.tip.type === 'prioritize_urgent'}
							<div class="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
								<h4 class="font-semibold text-blue-400">Focus on Urgent Goal</h4>
								<p class="mt-1 text-sm text-gray-300">
									Your {savingInsights.tip.goal?.description} goal is due in {savingInsights.tip
										.daysRemaining} day{savingInsights.tip.daysRemaining !== 1 ? 's' : ''}. You need
									to save ${(savingInsights.tip.dailyRequired ?? 0).toFixed(2)} per day to reach your
									target. Consider prioritizing this goal.
								</p>
							</div>
						{:else if savingInsights.tip.type === 'allocate_balance'}
							<div class="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
								<h4 class="font-semibold text-blue-400">Allocate Available Balance</h4>
								<p class="mt-1 text-sm text-gray-300">
									You have ${(savingInsights.tip.currentBalance ?? 0).toFixed(2)} available in your balance.
									Consider allocating some of this to your {savingInsights.tip.goalCount ?? 0} active
									saving goal{(savingInsights.tip.goalCount ?? 0) > 1 ? 's' : ''} to accelerate your
									progress.
								</p>
							</div>
						{/if}
					{:else}
						<div class="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
							<h4 class="font-semibold text-blue-400">Saving Tip</h4>
							<p class="mt-1 text-sm text-gray-300">
								Set up automatic transfers to your savings goals to maintain consistent progress.
								Even small, regular contributions compound over time.
							</p>
						</div>
					{/if}
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
