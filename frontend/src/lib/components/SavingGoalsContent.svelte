<script lang="ts">
	import { 
		Target, 
		TrendingUp, 
		Calendar, 
		Plus, 
		DollarSign,
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
	import { savingService, type SavingGoal } from '$lib/services/savings';
	import { firebaseUser, loading as authLoading } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	// State variables
	let goals = $state<SavingGoal[]>([]);
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

	// Form fields
	let formName = $state("");
	let formTarget = $state("");
	let formStartAmount = $state("");
	let formStartDate = $state(new Date().toISOString().split("T")[0]);
	let formEndDate = $state("");

	// Edit form fields
	let editFormName = $state("");
	let editFormTarget = $state("");
	let editFormStartAmount = $state("");
	let editFormStartDate = $state("");
	let editFormEndDate = $state("");

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
			const savingData = await savingService.getAllSavings();
			goals = savingData;
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
			endIndex: Math.min(endIndex, goals.length),
		};
	};

	const paginatedData = $derived(getPaginatedGoals());
	const totalTargets = $derived(goals.reduce((sum, goal) => sum + goal.target_amount, 0));
	const totalSaved = $derived(goals.reduce((sum, goal) => sum + goal.start_amount, 0));
	const overallProgress = $derived(totalTargets > 0 ? (totalSaved / totalTargets) * 100 : 0);
	const completedGoals = $derived(goals.filter((goal) => goal.completed || goal.start_amount >= goal.target_amount).length);

	async function handleAddGoal(event: Event) {
		event.preventDefault();
		
		if (!formName || !formTarget || !formStartDate || !formEndDate) {
			error = 'Please fill in all required fields';
			return;
		}

		isSaving = true;
		error = null;
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
			formName = "";
			formTarget = "";
			formStartAmount = "";
			formStartDate = new Date().toISOString().split("T")[0];
			formEndDate = "";

			// Show success message
			successMessage = 'Savings goal created successfully';
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error creating saving goal:', err);
			error = err instanceof Error ? err.message : 'Failed to create saving goal';
		} finally {
			isSaving = false;
		}
	}

	async function handleAddMoney(event: Event) {
		event.preventDefault();
		
		if (!selectedGoal) return;
		
		const formData = new FormData(event.target as HTMLFormElement);
		const amount = Number.parseFloat(formData.get("amount") as string);

		if (isNaN(amount) || amount <= 0) {
			error = 'Please enter a valid amount';
			return;
		}

		isSaving = true;
		error = null;
		try {
			const newAmount = Math.min(selectedGoal.start_amount + amount, selectedGoal.target_amount);
			const isCompleted = newAmount >= selectedGoal.target_amount;
			
			await savingService.updateSaving(selectedGoal.id, {
				start_amount: newAmount,
				completed: isCompleted
			});

			// Reload data to get updated amounts
			await loadData();
			
			isDepositDialogOpen = false;
			selectedGoal = null;
			
			successMessage = `$${amount.toLocaleString()} added successfully`;
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err) {
			console.error('Error adding money:', err);
			error = err instanceof Error ? err.message : 'Failed to add money';
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
		
		if (!editingGoal || !editFormName || !editFormTarget || !editFormStartDate || !editFormEndDate) {
			error = 'Please fill in all required fields';
			return;
		}

		isSaving = true;
		error = null;
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
			error = err instanceof Error ? err.message : 'Failed to update saving goal';
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
			case "high":
				return "bg-red-500/20 text-red-400 border-red-500/50";
			case "medium":
				return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
			case "low":
				return "bg-green-500/20 text-green-400 border-green-500/50";
			default:
				return "bg-gray-500/20 text-gray-400 border-gray-500/50";
		}
	}

	function setQuickAmount(amount: string) {
		const input = document.getElementById("amount") as HTMLInputElement;
		if (input) input.value = amount;
	}

	function setCompleteAmount(goal: SavingGoal) {
		const remaining = goal.target_amount - goal.start_amount;
		const input = document.getElementById("amount") as HTMLInputElement;
		if (input) input.value = remaining.toString();
	}

	function getTodayDate() {
		return new Date().toISOString().split("T")[0];
	}

	function getGoalStatus(current: number, target: number) {
		if (target <= 0) return { status: "No Target", color: "text-gray-400", bgColor: "bg-gray-500/20" };
		const percentage = (current / target) * 100;
		if (percentage >= 100) return { status: "Completed", color: "text-green-400", bgColor: "bg-green-500/20" };
		if (percentage >= 75) return { status: "Almost There", color: "text-yellow-400", bgColor: "bg-yellow-500/20" };
		if (percentage >= 25) return { status: "In Progress", color: "text-blue-400", bgColor: "bg-blue-500/20" };
		return { status: "Getting Started", color: "text-gray-400", bgColor: "bg-gray-500/20" };
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
				<Button class="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
					<Plus class="h-4 w-4 mr-2" />
					Add Goal
				</Button>
			</DialogTrigger>
			<DialogContent class="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
				<DialogHeader>
					<DialogTitle>Create New Savings Goal</DialogTitle>
					<DialogDescription class="text-gray-400">Set a new financial goal to work towards</DialogDescription>
				</DialogHeader>
				<form onsubmit={handleAddGoal} class="space-y-4">
					<div class="space-y-2">
						<Label for="name">Goal Name</Label>
						<Input
							id="name"
							bind:value={formName}
							placeholder="e.g., Emergency Fund, Vacation"
							required
							class="bg-gray-700 border-gray-600"
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
							class="bg-gray-700 border-gray-600"
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
						<Label for="deadline">Target Date</Label>
						<Input 
							id="deadline" 
							bind:value={formEndDate}
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
						{isSaving ? 'Creating...' : 'Create Goal'}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	</div>

	<!-- Edit Goal Dialog -->
	<Dialog bind:open={isEditDialogOpen}>
		<DialogContent class="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
			<DialogHeader>
				<DialogTitle>Edit Savings Goal</DialogTitle>
				<DialogDescription class="text-gray-400">Update your savings goal settings</DialogDescription>
			</DialogHeader>
			<form onsubmit={handleUpdateGoal} class="space-y-4">
				<div class="space-y-2">
					<Label for="editName">Goal Name</Label>
					<Input
						id="editName"
						bind:value={editFormName}
						placeholder="e.g., Emergency Fund, Vacation"
						required
						class="bg-gray-700 border-gray-600"
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
						class="bg-gray-700 border-gray-600"
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
					<Label for="editEndDate">Target Date</Label>
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
						{isSaving ? 'Updating...' : 'Update Goal'}
					</Button>
				</div>
			</form>
		</DialogContent>
	</Dialog>

	<!-- Goals Overview -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Total Goals</CardTitle>
				<Target class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">${totalTargets.toLocaleString()}</div>
				<p class="text-xs text-gray-400">{goals.length} active goals</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Total Saved</CardTitle>
				<DollarSign class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-green-400">${totalSaved.toLocaleString()}</div>
				<p class="text-xs text-gray-400">{totalTargets > 0 ? overallProgress.toFixed(1) : '0.0'}% of total goals</p>
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-gray-300">Overall Progress</CardTitle>
				<TrendingUp class="h-4 w-4 text-gray-400" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-white">{overallProgress.toFixed(1)}%</div>
				<Progress value={overallProgress} class="mt-2" />
			</CardContent>
		</Card>

		<Card class="bg-gray-900 border-gray-800">
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
	<Card class="bg-gray-900 border-gray-800">
		<CardHeader>
			<CardTitle class="text-white">Your Savings Goals</CardTitle>
			<div class="text-gray-400 flex items-center justify-between">
				<span>
					Showing {paginatedData.startIndex}-{paginatedData.endIndex} of {paginatedData.totalCount} goals
				</span>
				<span class="text-sm">
					Page {currentPage} of {paginatedData.totalPages}
				</span>
			</div>
		</CardHeader>
		<CardContent>
			<div class="space-y-6">
				{#each paginatedData.goals as goal (goal.id)}
					{@const percentage = goal.target_amount > 0 ? (goal.start_amount / goal.target_amount) * 100 : 0}
					{@const remaining = goal.target_amount - goal.start_amount}
					{@const isCompleted = goal.completed || goal.start_amount >= goal.target_amount}
					{@const goalStatus = getGoalStatus(goal.start_amount, goal.target_amount)}
					
					<div class="border border-gray-800 rounded-lg p-4 space-y-4 bg-gray-800">
						<div class="flex items-center justify-between">
							<div>
								<div class="flex items-center gap-2">
									<h3 class="font-semibold text-white">{goal.description}</h3>
									<Badge class="{goalStatus.bgColor} {goalStatus.color} border-0">
										{goalStatus.status}
									</Badge>
									{#if isCompleted}
										<Badge class="bg-green-500/20 text-green-400 border-green-500/50">Completed</Badge>
									{/if}
								</div>
								<p class="text-sm text-gray-400">Target: {new Date(goal.end_date).toLocaleDateString()}</p>
							</div>
							<div class="text-right">
								<p class="text-lg font-bold text-white">${goal.start_amount.toLocaleString()}</p>
								<p class="text-sm text-gray-400">of ${goal.target_amount.toLocaleString()}</p>
								<div class="mt-2 flex gap-2">
									{#if !isCompleted}
										<Button
											variant="outline"
											size="sm"
											onclick={() => {
												selectedGoal = goal;
												isDepositDialogOpen = true;
											}}
											class="bg-gray-900 border-2 border-blue-500 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 font-semibold shadow-lg flex-1"
										>
											Add Money
										</Button>
									{/if}
									<Button 
										variant="outline" 
										size="sm" 
										onclick={() => handleEditGoal(goal)}
										class="bg-gray-900 border-2 border-green-500 text-green-400 hover:bg-green-500/20 hover:text-green-300 font-semibold shadow-lg flex-1"
									>
										<Edit class="h-4 w-4 mr-1" />
										Edit
									</Button>
									<Button 
										variant="outline" 
										size="sm" 
										onclick={() => handleDeleteGoal(goal)}
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
								<span class="text-gray-300">{percentage.toFixed(1)}% complete</span>
							</div>
							<Progress value={Math.min(percentage, 100)} class="h-2" />
							<p class="text-xs text-gray-400">
								{#if remaining > 0}
									${remaining.toLocaleString()} remaining
								{:else}
									Goal achieved!
								{/if}
							</p>
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

	<!-- Add Money Dialog -->
	<Dialog bind:open={isDepositDialogOpen}>
		<DialogContent class="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
			<DialogHeader>
				<DialogTitle>Add Money - {selectedGoal?.description}</DialogTitle>
				<DialogDescription class="text-gray-400">
					{#if selectedGoal}
						Current: ${selectedGoal.start_amount.toLocaleString()} / ${selectedGoal.target_amount.toLocaleString()}
					{/if}
				</DialogDescription>
			</DialogHeader>
			<form onsubmit={handleAddMoney} class="space-y-4">
				<div class="space-y-2">
					<Label for="amount">Amount to Add</Label>
					<Input
						id="amount"
						name="amount"
						type="number"
						step="0.01"
						placeholder="0.00"
						min={0}
						max={selectedGoal ? selectedGoal.target_amount - selectedGoal.start_amount : undefined}
						required
						class="bg-gray-700 border-gray-600"
					/>
				</div>
				<div class="flex gap-2">
					<Button
						type="button"
						variant="outline"
						onclick={() => setQuickAmount("100")}
						class="border-gray-600 text-gray-300 hover:bg-gray-700"
					>
						$100
					</Button>
					<Button
						type="button"
						variant="outline"
						onclick={() => setQuickAmount("500")}
						class="border-gray-600 text-gray-300 hover:bg-gray-700"
					>
						$500
					</Button>
					{#if selectedGoal}
						<Button
							type="button"
							variant="outline"
							onclick={() => setCompleteAmount(selectedGoal)}
							class="border-gray-600 text-gray-300 hover:bg-gray-700"
						>
							Complete Goal
						</Button>
					{/if}
				</div>
				<div class="flex gap-2">
					<Button
						type="button"
						variant="outline"
						onclick={() => {
							isDepositDialogOpen = false;
							selectedGoal = null;
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
						{isSaving ? 'Adding...' : 'Add Money'}
					</Button>
				</div>
			</form>
		</DialogContent>
	</Dialog>

	<!-- Goal Insights -->
	<Card class="bg-gray-900 border-gray-800">
		<CardHeader>
			<CardTitle class="text-white">Goal Insights</CardTitle>
			<div class="text-gray-400">AI-powered recommendations for your savings goals</div>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
					<h4 class="font-semibold text-green-400">On Track</h4>
					<p class="text-sm text-gray-300 mt-1">
						Your Emergency Fund is progressing well! At your current savings rate, you'll reach your goal 2 months early.
					</p>
				</div>

				<div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
					<h4 class="font-semibold text-blue-400">Optimization Tip</h4>
					<p class="text-sm text-gray-300 mt-1">
						Consider setting up automatic transfers of $200/month to accelerate your Vacation Fund progress.
					</p>
				</div>

				<div class="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
					<h4 class="font-semibold text-yellow-400">Priority Adjustment</h4>
					<p class="text-sm text-gray-300 mt-1">
						Focus on your high-priority goals first. Consider reducing contributions to low-priority goals temporarily.
					</p>
				</div>
			</div>
		</CardContent>
	</Card>
	{/if}
</div> 