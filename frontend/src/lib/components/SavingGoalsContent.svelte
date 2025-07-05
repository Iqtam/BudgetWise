<script lang="ts">
	import { 
		Target, 
		TrendingUp, 
		Calendar, 
		Plus, 
		DollarSign 
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
		DialogTitle
	} from '$lib/components/ui/dialog';

	const mockGoals = [
		{ id: 1, name: "Emergency Fund", target: 10000, current: 6800, deadline: "2024-12-31", priority: "high" },
		{ id: 2, name: "Vacation Fund", target: 3000, current: 1850, deadline: "2024-08-15", priority: "medium" },
		{ id: 3, name: "New Car", target: 25000, current: 8500, deadline: "2025-06-30", priority: "low" },
		{ id: 4, name: "Home Down Payment", target: 50000, current: 12000, deadline: "2026-01-01", priority: "high" },
		{ id: 5, name: "Wedding Fund", target: 15000, current: 4500, deadline: "2025-09-15", priority: "high" },
		{ id: 6, name: "Retirement Boost", target: 20000, current: 8900, deadline: "2024-12-31", priority: "medium" },
		{ id: 7, name: "Education Fund", target: 8000, current: 2100, deadline: "2025-08-30", priority: "medium" },
		{ id: 8, name: "Home Renovation", target: 12000, current: 3200, deadline: "2025-05-01", priority: "low" },
		{ id: 9, name: "Business Investment", target: 30000, current: 5600, deadline: "2026-03-15", priority: "medium" },
		{ id: 10, name: "Travel Fund", target: 5000, current: 1200, deadline: "2024-11-20", priority: "low" },
		{ id: 11, name: "Tech Upgrade", target: 2500, current: 800, deadline: "2024-09-01", priority: "low" },
		{ id: 12, name: "Health & Wellness", target: 4000, current: 1500, deadline: "2024-12-31", priority: "medium" },
		{ id: 13, name: "Gift Fund", target: 1500, current: 600, deadline: "2024-12-15", priority: "low" },
		{ id: 14, name: "Pet Care Fund", target: 3000, current: 900, deadline: "2025-06-01", priority: "medium" },
		{ id: 15, name: "Hobby Equipment", target: 2000, current: 450, deadline: "2025-03-30", priority: "low" }
	];

	let goals = $state(mockGoals);
	let isGoalDialogOpen = $state(false);
	let isDepositDialogOpen = $state(false);
	let selectedGoal = $state<number | null>(null);
	let currentPage = $state(1);
	const itemsPerPage = 10;

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
	const totalTargets = $derived(goals.reduce((sum, goal) => sum + goal.target, 0));
	const totalSaved = $derived(goals.reduce((sum, goal) => sum + goal.current, 0));
	const overallProgress = $derived((totalSaved / totalTargets) * 100);
	const completedGoals = $derived(goals.filter((goal) => goal.current >= goal.target).length);

	function handleAddGoal(event: Event) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		
		const name = formData.get("name") as string;
		const target = Number.parseFloat(formData.get("target") as string);
		const startAmount = Number.parseFloat(formData.get("startAmount") as string) || 0;
		const startDate = formData.get("startDate") as string;
		const deadline = formData.get("deadline") as string;

		const newGoal = {
			id: goals.length + 1,
			name,
			target,
			current: startAmount,
			deadline,
			startDate,
			priority: "medium"
		};

		goals = [...goals, newGoal];
		isGoalDialogOpen = false;
		
		console.log(`Goal Created: Savings goal "${name}" with target of $${target.toLocaleString()} has been set.`);
	}

	function handleAddMoney(event: Event) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		const amount = Number.parseFloat(formData.get("amount") as string);

		if (selectedGoal !== null) {
			goals = goals.map((goal) =>
				goal.id === selectedGoal ? { ...goal, current: Math.min(goal.current + amount, goal.target) } : goal
			);

			const goalName = goals.find((g) => g.id === selectedGoal)?.name;
			isDepositDialogOpen = false;
			selectedGoal = null;
			
			console.log(`Money Added: $${amount.toLocaleString()} added to ${goalName}.`);
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

	function setCompleteAmount(goalId: number) {
		const goal = goals.find(g => g.id === goalId);
		if (goal) {
			const remaining = goal.target - goal.current;
			const input = document.getElementById("amount") as HTMLInputElement;
			if (input) input.value = remaining.toString();
		}
	}

	function getTodayDate() {
		return new Date().toISOString().split("T")[0];
	}
</script>

<div class="flex-1 space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold text-white">Savings Goals</h2>
			<p class="text-gray-400">Track progress toward your financial goals</p>
		</div>
		
		<Dialog bind:open={isGoalDialogOpen}>
			<Button 
				onclick={() => isGoalDialogOpen = true}
				class="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
			>
				<Plus class="h-4 w-4 mr-2" />
				Add Goal
			</Button>
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
							name="name"
							placeholder="e.g., Emergency Fund, Vacation"
							required
							class="bg-gray-700 border-gray-600"
						/>
					</div>
					<div class="space-y-2">
						<Label for="target">Target Amount</Label>
						<Input
							id="target"
							name="target"
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
							name="startAmount"
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
							name="startDate"
							type="date"
							value={getTodayDate()}
							required
							class="bg-gray-700 border-gray-600"
						/>
					</div>
					<div class="space-y-2">
						<Label for="deadline">Target Date</Label>
						<Input 
							id="deadline" 
							name="deadline" 
							type="date" 
							required 
							class="bg-gray-700 border-gray-600" 
						/>
					</div>
					<Button
						type="submit"
						class="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
					>
						Create Goal
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	</div>

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
				<p class="text-xs text-gray-400">{overallProgress.toFixed(1)}% of total goals</p>
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
					{@const percentage = (goal.current / goal.target) * 100}
					{@const remaining = goal.target - goal.current}
					{@const isCompleted = goal.current >= goal.target}
					
					<div class="border border-gray-800 rounded-lg p-4 space-y-4 bg-gray-800">
						<div class="flex items-center justify-between">
							<div>
								<div class="flex items-center gap-2">
									<h3 class="font-semibold text-white">{goal.name}</h3>
									<Badge class={getPriorityColor(goal.priority)}>{goal.priority} priority</Badge>
									{#if isCompleted}
										<Badge class="bg-green-500/20 text-green-400 border-green-500/50">Completed</Badge>
									{/if}
								</div>
								<p class="text-sm text-gray-400">Target: {goal.deadline}</p>
							</div>
							<div class="text-right">
								<p class="text-lg font-bold text-white">${goal.current.toLocaleString()}</p>
								<p class="text-sm text-gray-400">of ${goal.target.toLocaleString()}</p>
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

						<div class="flex gap-2">
							{#if !isCompleted}
								<Dialog 
									bind:open={isDepositDialogOpen} 
									onOpenChange={(open) => {
										if (!open) selectedGoal = null;
									}}
								>
									<Button
										variant="outline"
										size="sm"
										onclick={() => {
											selectedGoal = goal.id;
											isDepositDialogOpen = true;
										}}
										class="border-gray-600 text-gray-300 hover:bg-gray-700"
									>
										Add Money
									</Button>
									{#if selectedGoal === goal.id}
										<DialogContent class="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
											<DialogHeader>
												<DialogTitle>Add Money - {goal.name}</DialogTitle>
												<DialogDescription class="text-gray-400">
													Current: ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
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
														max={remaining}
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
													<Button
														type="button"
														variant="outline"
														onclick={() => setCompleteAmount(goal.id)}
														class="border-gray-600 text-gray-300 hover:bg-gray-700"
													>
														Complete Goal
													</Button>
												</div>
												<Button
													type="submit"
													class="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
												>
													Add Money
												</Button>
											</form>
										</DialogContent>
									{/if}
								</Dialog>
							{/if}

							<Button 
								variant="ghost" 
								size="sm" 
								class="text-gray-400 hover:text-white hover:bg-gray-800"
							>
								View Details
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
</div> 